import { Router } from 'express';
import { db } from '../db';
import { 
  medications, 
  pharmacyPrescriptions, 
  prescriptionItems, 
  dispensations,
  patients,
  users,
  facilities 
} from '../../shared/schema';
import { eq, desc, and, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schemas
const medicationSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional(),
  dosageForm: z.string().min(1),
  strength: z.string().min(1),
  category: z.string().min(1),
  stockLevel: z.number().min(0).default(0),
  minimumStock: z.number().min(0).default(10),
  unitCost: z.number().min(0).default(0),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  manufacturer: z.string().optional(),
  isActive: z.boolean().default(true)
});

const prescriptionSchema = z.object({
  patientId: z.number().min(1),
  diagnosis: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  instructions: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(z.object({
    medicationId: z.number().min(1),
    quantity: z.number().min(1),
    dosage: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional()
  })).min(1)
});

const dispensationSchema = z.object({
  prescriptionId: z.number().min(1),
  paymentMethod: z.enum(['cash', 'insurance', 'free']).optional(),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional(),
  patientCounseled: z.boolean().default(false),
  counselingNotes: z.string().optional(),
  items: z.array(z.object({
    prescriptionItemId: z.number().min(1),
    quantityDispensed: z.number().min(1),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional()
  })).min(1)
});

// Get pharmacy statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalPrescriptions,
      pendingPrescriptions,
      dispensedToday,
      lowStockItems
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(pharmacyPrescriptions),
      db.select({ count: sql<number>`count(*)` }).from(pharmacyPrescriptions).where(eq(pharmacyPrescriptions.status, 'pending')),
      db.select({ count: sql<number>`count(*)` }).from(dispensations).where(sql`${dispensations.dispensedAt} >= ${today}`),
      db.select({ count: sql<number>`count(*)` }).from(medications).where(sql`${medications.stockLevel} <= ${medications.minimumStock}`)
    ]);

    const stats = {
      totalPrescriptions: totalPrescriptions[0]?.count || 0,
      pendingPrescriptions: pendingPrescriptions[0]?.count || 0,
      dispensedToday: dispensedToday[0]?.count || 0,
      lowStockItems: lowStockItems[0]?.count || 0,
      totalRevenue: 0, // This would need to be calculated from actual dispensations
      pendingDispensations: pendingPrescriptions[0]?.count || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching pharmacy stats:', error);
    res.status(500).json({ error: 'Failed to fetch pharmacy statistics' });
  }
});

// Get medications with search
router.get('/medications', async (req, res) => {
  try {
    const { q } = req.query;
    
    let query = db.select().from(medications).where(eq(medications.isActive, true));
    
    if (q && typeof q === 'string') {
      query = query.where(
        or(
          ilike(medications.name, `%${q}%`),
          ilike(medications.category, `%${q}%`),
          ilike(medications.genericName, `%${q}%`)
        )
      );
    }
    
    const result = await query.orderBy(medications.name).limit(20);
    res.json(result);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// Get low stock medications
router.get('/medications/low-stock', async (req, res) => {
  try {
    const result = await db.select().from(medications)
      .where(
        and(
          eq(medications.isActive, true),
          sql`${medications.stockLevel} <= ${medications.minimumStock}`
        )
      )
      .orderBy(sql`${medications.stockLevel} - ${medications.minimumStock}`);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching low stock medications:', error);
    res.status(500).json({ error: 'Failed to fetch low stock medications' });
  }
});

// Create medication
router.post('/medications', async (req, res) => {
  try {
    const data = medicationSchema.parse(req.body);
    
    const result = await db.insert(medications).values(data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating medication:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid medication data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create medication' });
    }
  }
});

// Get prescriptions with filters
router.get('/prescriptions', async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;
    
    let query = db.select({
      id: pharmacyPrescriptions.id,
      prescriptionNumber: pharmacyPrescriptions.prescriptionNumber,
      patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.surname})`,
      patientId: pharmacyPrescriptions.patientId,
      prescriber: users.fullName,
      diagnosis: pharmacyPrescriptions.diagnosis,
      status: pharmacyPrescriptions.status,
      priority: pharmacyPrescriptions.priority,
      issuedAt: pharmacyPrescriptions.issuedAt,
      validUntil: pharmacyPrescriptions.validUntil,
      totalCost: pharmacyPrescriptions.totalCost,
      instructions: pharmacyPrescriptions.instructions
    })
    .from(pharmacyPrescriptions)
    .leftJoin(patients, eq(pharmacyPrescriptions.patientId, patients.id))
    .leftJoin(users, eq(pharmacyPrescriptions.prescriberId, users.id));
    
    if (status) {
      query = query.where(eq(pharmacyPrescriptions.status, status as string));
    }
    
    if (priority) {
      query = query.where(eq(pharmacyPrescriptions.priority, priority as string));
    }
    
    const result = await query
      .orderBy(desc(pharmacyPrescriptions.issuedAt))
      .limit(parseInt(limit as string));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get recent prescriptions
router.get('/prescriptions/recent', async (req, res) => {
  try {
    const result = await db.select({
      id: pharmacyPrescriptions.id,
      prescriptionNumber: pharmacyPrescriptions.prescriptionNumber,
      patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.surname})`,
      prescriber: users.fullName,
      status: pharmacyPrescriptions.status,
      priority: pharmacyPrescriptions.priority,
      issuedAt: pharmacyPrescriptions.issuedAt,
      totalCost: pharmacyPrescriptions.totalCost
    })
    .from(pharmacyPrescriptions)
    .leftJoin(patients, eq(pharmacyPrescriptions.patientId, patients.id))
    .leftJoin(users, eq(pharmacyPrescriptions.prescriberId, users.id))
    .orderBy(desc(pharmacyPrescriptions.issuedAt))
    .limit(10);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching recent prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch recent prescriptions' });
  }
});

// Get pending prescriptions count
router.get('/prescriptions/pending-count', async (req, res) => {
  try {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(pharmacyPrescriptions)
      .where(eq(pharmacyPrescriptions.status, 'pending'));
    
    res.json({ count: result[0]?.count || 0 });
  } catch (error) {
    console.error('Error fetching pending prescriptions count:', error);
    res.status(500).json({ error: 'Failed to fetch pending prescriptions count' });
  }
});

// Get pending prescriptions for dispensation
router.get('/prescriptions/pending', async (req, res) => {
  try {
    const result = await db.select({
      id: pharmacyPrescriptions.id,
      prescriptionNumber: pharmacyPrescriptions.prescriptionNumber,
      patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.surname})`,
      patientId: pharmacyPrescriptions.patientId,
      prescriber: users.fullName,
      diagnosis: pharmacyPrescriptions.diagnosis,
      priority: pharmacyPrescriptions.priority,
      issuedAt: pharmacyPrescriptions.issuedAt,
      validUntil: pharmacyPrescriptions.validUntil,
      totalCost: pharmacyPrescriptions.totalCost
    })
    .from(pharmacyPrescriptions)
    .leftJoin(patients, eq(pharmacyPrescriptions.patientId, patients.id))
    .leftJoin(users, eq(pharmacyPrescriptions.prescriberId, users.id))
    .where(eq(pharmacyPrescriptions.status, 'pending'))
    .orderBy(desc(pharmacyPrescriptions.issuedAt));
    
    // Get prescription items for each prescription
    const prescriptionsWithItems = await Promise.all(
      result.map(async (prescription) => {
        const items = await db.select({
          id: prescriptionItems.id,
          medicationName: medications.name,
          dosage: prescriptionItems.dosage,
          duration: prescriptionItems.duration,
          quantity: prescriptionItems.quantity,
          quantityDispensed: prescriptionItems.quantityDispensed,
          unitCost: prescriptionItems.unitCost,
          totalCost: prescriptionItems.totalCost,
          instructions: prescriptionItems.instructions,
          status: prescriptionItems.status
        })
        .from(prescriptionItems)
        .leftJoin(medications, eq(prescriptionItems.medicationId, medications.id))
        .where(eq(prescriptionItems.prescriptionId, prescription.id));
        
        return {
          ...prescription,
          items
        };
      })
    );
    
    res.json(prescriptionsWithItems);
  } catch (error) {
    console.error('Error fetching pending prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch pending prescriptions' });
  }
});

// Create prescription
router.post('/prescriptions', async (req, res) => {
  try {
    const data = prescriptionSchema.parse(req.body);
    
    // Generate prescription number
    const prescriptionNumber = `RX${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Calculate total cost
    const totalCost = data.items.reduce((sum, item) => {
      // This would need to fetch actual medication cost
      return sum + (item.quantity * 1000); // Placeholder calculation
    }, 0);
    
    // Create prescription
    const prescription = await db.insert(pharmacyPrescriptions).values({
      patientId: data.patientId,
      prescriberId: 1, // This should come from authenticated user
      facilityId: 1, // This should come from user's facility
      prescriptionNumber,
      diagnosis: data.diagnosis,
      priority: data.priority,
      instructions: data.instructions,
      totalCost,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined
    }).returning();
    
    // Create prescription items
    const items = await Promise.all(
      data.items.map(async (item) => {
        // Get medication cost
        const medication = await db.select().from(medications).where(eq(medications.id, item.medicationId)).limit(1);
        const unitCost = medication[0]?.unitCost || 0;
        
        return db.insert(prescriptionItems).values({
          prescriptionId: prescription[0].id,
          medicationId: item.medicationId,
          quantity: item.quantity,
          dosage: item.dosage,
          duration: item.duration,
          instructions: item.instructions,
          unitCost,
          totalCost: unitCost * item.quantity
        }).returning();
      })
    );
    
    res.status(201).json({
      prescription: prescription[0],
      items: items.flat()
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid prescription data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create prescription' });
    }
  }
});

// Get dispensations
router.get('/dispensations', async (req, res) => {
  try {
    const result = await db.select({
      id: dispensations.id,
      dispensationNumber: dispensations.dispensationNumber,
      prescriptionNumber: pharmacyPrescriptions.prescriptionNumber,
      patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.surname})`,
      totalAmount: dispensations.totalAmount,
      amountPaid: dispensations.amountPaid,
      paymentMethod: dispensations.paymentMethod,
      patientCounseled: dispensations.patientCounseled,
      dispensedAt: dispensations.dispensedAt,
      dispensedBy: users.fullName
    })
    .from(dispensations)
    .leftJoin(pharmacyPrescriptions, eq(dispensations.prescriptionId, pharmacyPrescriptions.id))
    .leftJoin(patients, eq(pharmacyPrescriptions.patientId, patients.id))
    .leftJoin(users, eq(dispensations.dispensedBy, users.id))
    .orderBy(desc(dispensations.dispensedAt))
    .limit(50);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching dispensations:', error);
    res.status(500).json({ error: 'Failed to fetch dispensations' });
  }
});

// Create dispensation
router.post('/dispensations', async (req, res) => {
  try {
    const data = dispensationSchema.parse(req.body);
    
    // Generate dispensation number
    const dispensationNumber = `DIS${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Calculate total amount from prescription items
    const prescriptionItemsList = await db.select()
      .from(prescriptionItems)
      .where(eq(prescriptionItems.prescriptionId, data.prescriptionId));
    
    const totalAmount = prescriptionItemsList.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Create dispensation
    const dispensation = await db.insert(dispensations).values({
      prescriptionId: data.prescriptionId,
      dispensedBy: 1, // This should come from authenticated user
      facilityId: 1, // This should come from user's facility
      dispensationNumber,
      totalAmount,
      amountPaid: data.amountPaid * 100, // Convert to cents
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      patientCounseled: data.patientCounseled,
      counselingNotes: data.counselingNotes
    }).returning();
    
    // Update prescription items with dispensed quantities
    await Promise.all(
      data.items.map(async (item) => {
        await db.update(prescriptionItems)
          .set({ 
            quantityDispensed: item.quantityDispensed,
            status: 'dispensed'
          })
          .where(eq(prescriptionItems.id, item.prescriptionItemId));
      })
    );
    
    // Update prescription status
    await db.update(pharmacyPrescriptions)
      .set({ 
        status: 'dispensed',
        dispensedAt: new Date(),
        dispensedBy: 1 // This should come from authenticated user
      })
      .where(eq(pharmacyPrescriptions.id, data.prescriptionId));
    
    res.status(201).json(dispensation[0]);
  } catch (error) {
    console.error('Error creating dispensation:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid dispensation data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create dispensation' });
    }
  }
});

// Get dispensation history
router.get('/dispensations/history', async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, startDate, endDate } = req.query;
    
    let query = db.select({
      id: dispensations.id,
      prescriptionId: dispensations.prescriptionId,
      prescriptionNumber: pharmacyPrescriptions.prescriptionNumber,
      patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.surname})`,
      patientId: dispensations.patientId,
      dispensedBy: users.fullName,
      dispensedAt: dispensations.dispensedAt,
      paymentMethod: dispensations.paymentMethod,
      amountPaid: dispensations.amountPaid,
      totalCost: dispensations.totalCost,
      status: dispensations.status,
      notes: dispensations.notes,
      patientCounseled: dispensations.patientCounseled,
      counselingNotes: dispensations.counselingNotes
    })
    .from(dispensations)
    .leftJoin(pharmacyPrescriptions, eq(dispensations.prescriptionId, pharmacyPrescriptions.id))
    .leftJoin(patients, eq(dispensations.patientId, patients.id))
    .leftJoin(users, eq(dispensations.dispensedBy, users.id));
    
    // Apply filters
    const conditions = [];
    if (patientId) {
      conditions.push(eq(dispensations.patientId, Number(patientId)));
    }
    if (startDate) {
      conditions.push(sql`${dispensations.dispensedAt} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${dispensations.dispensedAt} <= ${endDate}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    const result = await query
      .orderBy(desc(dispensations.dispensedAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Get dispensation items for each record
    const dispensationsWithItems = await Promise.all(
      result.map(async (dispensation) => {
        const items = await db.select({
          id: dispensationItems.id,
          medicationName: medications.name,
          quantityDispensed: dispensationItems.quantityDispensed,
          batchNumber: dispensationItems.batchNumber,
          expiryDate: dispensationItems.expiryDate,
          unitCost: dispensationItems.unitCost,
          totalCost: dispensationItems.totalCost
        })
        .from(dispensationItems)
        .leftJoin(medications, eq(dispensationItems.medicationId, medications.id))
        .where(eq(dispensationItems.dispensationId, dispensation.id));
        
        return {
          ...dispensation,
          items
        };
      })
    );
    
    res.json(dispensationsWithItems);
  } catch (error) {
    console.error('Error fetching dispensation history:', error);
    res.status(500).json({ error: 'Failed to fetch dispensation history' });
  }
});

export default router;