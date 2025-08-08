/**
 * Smart Inter-Facility Patient Transfer Engine
 * Implements intelligent routing, capacity management, and transfer coordination
 * for the Zambian healthcare network in SmartCare PRO
 */

import { db } from "./db";
import { patients } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface HealthFacility {
  id: string;
  name: string;
  type: 'Health Post' | 'Rural Health Centre' | 'Urban Health Centre' | 'District Hospital' | 'Provincial Hospital' | 'Central Hospital';
  province: string;
  district: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  services: string[];
  capacity: {
    beds: number;
    icu: number;
    maternity: number;
    nicu: number;
  };
  currentOccupancy: {
    beds: number;
    icu: number;
    maternity: number;
    nicu: number;
  };
  specialties: string[];
  emergencyCapable: boolean;
  ambulanceServices: boolean;
  lastUpdated: Date;
}

export interface TransferRequest {
  patientId: number;
  fromFacility: string;
  urgency: 'Emergency' | 'Urgent' | 'Scheduled';
  condition: string;
  requiredServices: string[];
  requiredSpecialty?: string;
  transportNeeds: 'Ambulance' | 'Air Transport' | 'Standard Transport';
  medicalEscort: boolean;
  timeConstraint?: number; // hours
  preferredDestination?: string;
}

export interface TransferRoute {
  destination: HealthFacility;
  distance: number;
  estimatedTravelTime: number;
  routeType: 'Direct' | 'Via Hub';
  transportMethod: 'Road' | 'Air' | 'Water';
  cost: number;
  availability: boolean;
  waitingList: number;
  recommendationScore: number;
  reasoning: string[];
}

export interface TransferPlan {
  transferId: string;
  patient: any;
  fromFacility: HealthFacility;
  recommendedRoutes: TransferRoute[];
  primaryRecommendation: TransferRoute;
  transportArrangements: {
    method: string;
    provider: string;
    estimatedCost: number;
    requiredEquipment: string[];
  };
  clinicalHandoff: {
    documents: string[];
    keyInformation: string[];
    emergencyContacts: string[];
  };
  timeline: {
    preparation: number;
    transport: number;
    total: number;
  };
}

// Comprehensive database of Zambian health facilities
const ZAMBIAN_FACILITIES: HealthFacility[] = [
  // Central Hospitals
  {
    id: "UTH",
    name: "University Teaching Hospital",
    type: "Central Hospital",
    province: "Lusaka",
    district: "Lusaka",
    coordinates: { latitude: -15.3875, longitude: 28.3228 },
    services: ["Emergency", "ICU", "Surgery", "Maternity", "NICU", "Oncology", "Cardiology", "Neurology"],
    capacity: { beds: 1800, icu: 50, maternity: 200, nicu: 30 },
    currentOccupancy: { beds: 1620, icu: 45, maternity: 180, nicu: 25 },
    specialties: ["All Specialties"],
    emergencyCapable: true,
    ambulanceServices: true,
    lastUpdated: new Date()
  },
  {
    id: "LEVY",
    name: "Levy Mwanawasa Medical University Teaching Hospital",
    type: "Central Hospital",
    province: "Lusaka",
    district: "Lusaka", 
    coordinates: { latitude: -15.4067, longitude: 28.2833 },
    services: ["Emergency", "ICU", "Surgery", "Maternity", "NICU", "Cardiology"],
    capacity: { beds: 650, icu: 20, maternity: 80, nicu: 15 },
    currentOccupancy: { beds: 585, icu: 18, maternity: 72, nicu: 12 },
    specialties: ["Cardiology", "Surgery", "Internal Medicine"],
    emergencyCapable: true,
    ambulanceServices: true,
    lastUpdated: new Date()
  },
  // Provincial Hospitals
  {
    id: "NDOLA_CENTRAL",
    name: "Ndola Central Hospital",
    type: "Provincial Hospital",
    province: "Copperbelt",
    district: "Ndola",
    coordinates: { latitude: -12.9767, longitude: 28.6367 },
    services: ["Emergency", "ICU", "Surgery", "Maternity", "NICU"],
    capacity: { beds: 400, icu: 15, maternity: 60, nicu: 8 },
    currentOccupancy: { beds: 360, icu: 13, maternity: 54, nicu: 6 },
    specialties: ["Surgery", "Obstetrics", "Pediatrics"],
    emergencyCapable: true,
    ambulanceServices: true,
    lastUpdated: new Date()
  },
  {
    id: "LIVINGSTONE_GENERAL",
    name: "Livingstone General Hospital",
    type: "Provincial Hospital", 
    province: "Southern",
    district: "Livingstone",
    coordinates: { latitude: -17.8419, longitude: 25.8544 },
    services: ["Emergency", "Surgery", "Maternity"],
    capacity: { beds: 250, icu: 8, maternity: 40, nicu: 4 },
    currentOccupancy: { beds: 225, icu: 7, maternity: 36, nicu: 3 },
    specialties: ["Surgery", "Obstetrics"],
    emergencyCapable: true,
    ambulanceServices: true,
    lastUpdated: new Date()
  },
  // District Hospitals
  {
    id: "KAFUE_DISTRICT",
    name: "Kafue District Hospital", 
    type: "District Hospital",
    province: "Lusaka",
    district: "Kafue",
    coordinates: { latitude: -15.7694, longitude: 28.1814 },
    services: ["Emergency", "Surgery", "Maternity"],
    capacity: { beds: 120, icu: 2, maternity: 20, nicu: 2 },
    currentOccupancy: { beds: 108, icu: 2, maternity: 18, nicu: 1 },
    specialties: ["General Medicine", "Obstetrics"],
    emergencyCapable: true,
    ambulanceServices: false,
    lastUpdated: new Date()
  },
  // Rural Health Centres
  {
    id: "CHIKANDO_RHC",
    name: "Chikando Rural Health Centre",
    type: "Rural Health Centre",
    province: "Lusaka",
    district: "Kafue",
    coordinates: { latitude: -15.8000, longitude: 28.2000 },
    services: ["Basic Emergency", "Maternity", "ANC"],
    capacity: { beds: 30, icu: 0, maternity: 8, nicu: 0 },
    currentOccupancy: { beds: 25, icu: 0, maternity: 6, nicu: 0 },
    specialties: ["General Medicine"],
    emergencyCapable: false,
    ambulanceServices: false,
    lastUpdated: new Date()
  },
  {
    id: "CHAMAKUBI_HP",
    name: "Chamakubi Health Post",
    type: "Health Post",
    province: "Lusaka", 
    district: "Kafue",
    coordinates: { latitude: -15.8200, longitude: 28.2200 },
    services: ["Basic Care", "ANC"],
    capacity: { beds: 6, icu: 0, maternity: 2, nicu: 0 },
    currentOccupancy: { beds: 4, icu: 0, maternity: 1, nicu: 0 },
    specialties: [],
    emergencyCapable: false,
    ambulanceServices: false,
    lastUpdated: new Date()
  }
];

export class SmartTransferEngine {
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Estimate travel time based on distance and road conditions
   */
  private estimateTravelTime(distance: number, fromType: string, toType: string): number {
    // Base speed varies by road quality and facility types
    let baseSpeed = 40; // km/h for rural roads
    
    if (fromType.includes('Hospital') || toType.includes('Hospital')) {
      baseSpeed = 60; // Better roads to hospitals
    }
    
    if (distance > 200) {
      baseSpeed = 80; // Highway speeds for long distances
    }
    
    return distance / baseSpeed; // hours
  }

  /**
   * Calculate transport cost based on distance and method
   */
  private calculateTransportCost(distance: number, method: string, urgency: string): number {
    const baseCosts = {
      'Road': 2.5, // USD per km
      'Air': 15.0, // USD per km  
      'Water': 3.0  // USD per km
    };
    
    let cost = distance * baseCosts[method as keyof typeof baseCosts];
    
    // Emergency surcharge
    if (urgency === 'Emergency') {
      cost *= 1.5;
    }
    
    return cost;
  }

  /**
   * Score facilities based on suitability for transfer
   */
  private scoreFacility(facility: HealthFacility, request: TransferRequest, distance: number): number {
    let score = 100;
    
    // Distance penalty (closer is better)
    score -= distance * 0.5;
    
    // Capacity bonus/penalty
    const bedUtilization = facility.currentOccupancy.beds / facility.capacity.beds;
    if (bedUtilization > 0.9) score -= 30; // Very full
    else if (bedUtilization < 0.7) score += 10; // Good availability
    
    // Service matching bonus
    const serviceMatch = request.requiredServices.filter(service => 
      facility.services.includes(service)
    ).length;
    score += serviceMatch * 15;
    
    // Specialty matching bonus
    if (request.requiredSpecialty && facility.specialties.includes(request.requiredSpecialty)) {
      score += 25;
    }
    
    // Emergency capability bonus
    if (request.urgency === 'Emergency' && facility.emergencyCapable) {
      score += 20;
    }
    
    // Facility level bonus (higher level = more capabilities)
    const levelBonus = {
      'Central Hospital': 30,
      'Provincial Hospital': 20,
      'District Hospital': 10,
      'Urban Health Centre': 5,
      'Rural Health Centre': 0,
      'Health Post': -10
    };
    score += levelBonus[facility.type];
    
    return Math.max(0, score);
  }

  /**
   * Find the best transfer routes for a patient
   */
  async findOptimalRoutes(request: TransferRequest): Promise<TransferRoute[]> {
    const fromFacility = ZAMBIAN_FACILITIES.find(f => f.id === request.fromFacility || f.name === request.fromFacility);
    
    if (!fromFacility) {
      throw new Error('Source facility not found');
    }
    
    const routes: TransferRoute[] = [];
    
    // Filter facilities that can handle the required services
    const suitableFacilities = ZAMBIAN_FACILITIES.filter(facility => {
      // Don't transfer to same facility
      if (facility.id === fromFacility.id) return false;
      
      // Must have required services
      const hasRequiredServices = request.requiredServices.every(service =>
        facility.services.includes(service)
      );
      
      // Must have required specialty if specified
      const hasRequiredSpecialty = !request.requiredSpecialty || 
        facility.specialties.includes(request.requiredSpecialty);
      
      // Must have capacity
      const hasCapacity = facility.currentOccupancy.beds < facility.capacity.beds;
      
      return hasRequiredServices && hasRequiredSpecialty && hasCapacity;
    });
    
    // Calculate routes for each suitable facility
    for (const facility of suitableFacilities) {
      const distance = this.calculateDistance(
        fromFacility.coordinates.latitude,
        fromFacility.coordinates.longitude,
        facility.coordinates.latitude,
        facility.coordinates.longitude
      );
      
      const travelTime = this.estimateTravelTime(distance, fromFacility.type, facility.type);
      const transportMethod = distance > 300 ? 'Air' : 'Road';
      const cost = this.calculateTransportCost(distance, transportMethod, request.urgency);
      const score = this.scoreFacility(facility, request, distance);
      
      // Availability check
      const bedUtilization = facility.currentOccupancy.beds / facility.capacity.beds;
      const available = bedUtilization < 0.95;
      
      // Generate reasoning
      const reasoning: string[] = [];
      reasoning.push(`${distance.toFixed(1)}km distance (${travelTime.toFixed(1)} hour travel)`);
      reasoning.push(`${facility.capacity.beds - facility.currentOccupancy.beds} beds available`);
      
      if (request.requiredSpecialty && facility.specialties.includes(request.requiredSpecialty)) {
        reasoning.push(`Has required ${request.requiredSpecialty} specialty`);
      }
      
      if (facility.emergencyCapable && request.urgency === 'Emergency') {
        reasoning.push('Emergency care capable');
      }
      
      routes.push({
        destination: facility,
        distance,
        estimatedTravelTime: travelTime,
        routeType: distance > 100 ? 'Via Hub' : 'Direct',
        transportMethod: transportMethod as 'Road' | 'Air' | 'Water',
        cost,
        availability: available,
        waitingList: Math.max(0, facility.currentOccupancy.beds - facility.capacity.beds + 5),
        recommendationScore: score,
        reasoning
      });
    }
    
    // Sort by recommendation score (highest first)
    return routes.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  /**
   * Generate a comprehensive transfer plan
   */
  async generateTransferPlan(request: TransferRequest): Promise<TransferPlan> {
    // Get patient details
    const patient = await db.select().from(patients).where(eq(patients.id, request.patientId)).limit(1);
    
    if (!patient.length) {
      throw new Error('Patient not found');
    }
    
    const routes = await this.findOptimalRoutes(request);
    
    if (routes.length === 0) {
      throw new Error('No suitable facilities found for transfer');
    }
    
    const primaryRoute = routes[0];
    const fromFacility = ZAMBIAN_FACILITIES.find(f => f.id === request.fromFacility || f.name === request.fromFacility)!;
    
    // Determine transport arrangements
    const transportArrangements = {
      method: primaryRoute.transportMethod,
      provider: primaryRoute.transportMethod === 'Air' ? 'Zambia Air Rescue' : 'District Ambulance Service',
      estimatedCost: primaryRoute.cost,
      requiredEquipment: this.getRequiredEquipment(request)
    };
    
    // Clinical handoff requirements
    const clinicalHandoff = {
      documents: [
        'Patient medical records',
        'Current medication list', 
        'Recent lab results',
        'Transfer summary note',
        'Insurance/payment information'
      ],
      keyInformation: [
        `Condition: ${request.condition}`,
        `Urgency: ${request.urgency}`,
        `Required services: ${request.requiredServices.join(', ')}`,
        'Current vital signs',
        'Treatment given en route'
      ],
      emergencyContacts: [
        'Receiving facility emergency contact',
        'Family/next of kin contact',
        'Referring physician contact'
      ]
    };
    
    // Timeline estimation
    const timeline = {
      preparation: request.urgency === 'Emergency' ? 0.5 : 1, // hours
      transport: primaryRoute.estimatedTravelTime,
      total: (request.urgency === 'Emergency' ? 0.5 : 1) + primaryRoute.estimatedTravelTime
    };
    
    return {
      transferId: `TXR-${Date.now()}-${request.patientId}`,
      patient: patient[0],
      fromFacility,
      recommendedRoutes: routes.slice(0, 3), // Top 3 options
      primaryRecommendation: primaryRoute,
      transportArrangements,
      clinicalHandoff,
      timeline
    };
  }

  /**
   * Get required equipment based on patient condition and transport needs
   */
  private getRequiredEquipment(request: TransferRequest): string[] {
    const equipment: string[] = ['Basic monitoring equipment', 'Oxygen supply'];
    
    if (request.medicalEscort) {
      equipment.push('Advanced life support equipment', 'Emergency medications');
    }
    
    if (request.condition.toLowerCase().includes('cardiac')) {
      equipment.push('Cardiac monitor', 'Defibrillator');
    }
    
    if (request.condition.toLowerCase().includes('respiratory')) {
      equipment.push('Ventilator', 'Respiratory support equipment');
    }
    
    if (request.condition.toLowerCase().includes('maternity') || request.condition.toLowerCase().includes('obstetric')) {
      equipment.push('Fetal monitor', 'Obstetric emergency kit');
    }
    
    return equipment;
  }

  /**
   * Get real-time facility capacity updates
   */
  async updateFacilityCapacity(facilityId: string, occupancyUpdate: any): Promise<void> {
    const facilityIndex = ZAMBIAN_FACILITIES.findIndex(f => f.id === facilityId);
    if (facilityIndex !== -1) {
      ZAMBIAN_FACILITIES[facilityIndex].currentOccupancy = {
        ...ZAMBIAN_FACILITIES[facilityIndex].currentOccupancy,
        ...occupancyUpdate
      };
      ZAMBIAN_FACILITIES[facilityIndex].lastUpdated = new Date();
    }
  }

  /**
   * Get facilities within a specific radius
   */
  getFacilitiesInRadius(centerLat: number, centerLon: number, radiusKm: number): HealthFacility[] {
    return ZAMBIAN_FACILITIES.filter(facility => {
      const distance = this.calculateDistance(
        centerLat, centerLon,
        facility.coordinates.latitude,
        facility.coordinates.longitude
      );
      return distance <= radiusKm;
    });
  }
}

export const smartTransferEngine = new SmartTransferEngine();