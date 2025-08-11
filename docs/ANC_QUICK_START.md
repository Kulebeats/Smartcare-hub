# ANC Module Quick Start Guide

## For Developers

### 🚀 Getting Started (5 minutes)

#### 1. Start the Application
```bash
npm run dev
```

#### 2. Access the Application
- Open browser to `http://localhost:5000`
- Login with test credentials
- Navigate to a patient record
- Click "ANC" module

#### 3. Key Files to Know

**Main Components:**
- `client/src/pages/anc/ANCTabsPage.tsx` - Main container
- `client/src/pages/anc/tabs/` - All tab components

**Services:**
- `client/src/services/anc/` - Business logic
- `client/src/hooks/anc/` - React Query hooks

**API:**
- `server/routes/anc.routes.ts` - Backend endpoints

### 📝 Common Development Tasks

#### Adding a New Field to a Tab

1. Update the component in `/tabs/`
2. Add to state interface
3. Update validation if required
4. Test the changes

Example:
```typescript
// In ExaminationTab.tsx
const [newField, setNewField] = useState('');

<Input
  label="New Field"
  value={newField}
  onChange={(e) => setNewField(e.target.value)}
/>
```

#### Adding a Clinical Rule

1. Open `clinical-rules.service.ts`
2. Add rule to `CLINICAL_RULES` array
3. Test with sample data

Example:
```typescript
{
  id: 'new_rule',
  name: 'My New Rule',
  condition: (data) => data.value > threshold,
  severity: 'medium',
  message: 'Alert message'
}
```

#### Creating a New API Endpoint

1. Add to `server/routes/anc.routes.ts`
2. Update storage if needed
3. Add TypeScript types

### 🧪 Testing

```bash
# Run tests
npm test

# Run specific test
npm test -- clinical-rules.test

# Watch mode
npm test -- --watch
```

### 🐛 Debugging

1. **Enable debug mode:**
```javascript
localStorage.setItem('ANC_DEBUG', 'true');
```

2. **Check network tab** for API calls
3. **React DevTools** for component state
4. **Console logs** are filtered by `safeLog` utility

### 📊 Architecture Overview

```
User → Tab Component → Hook → API → Backend
         ↓
    Clinical Rules → Alerts → UI Update
```

### 🔧 Environment Setup

Required environment variables:
```env
DATABASE_URL=postgresql://...
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

### 📚 Key Concepts

**1. Tab-Based Architecture**
- Each tab is independent
- State managed per tab
- Navigation preserves data

**2. Clinical Decision Support**
- Real-time evaluation
- Automatic alert generation
- Evidence-based rules

**3. React Query Integration**
- Automatic caching
- Background refetching
- Optimistic updates

### 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tabs not loading | Check patient ID in URL |
| Alerts not showing | Verify clinical rules thresholds |
| Data not saving | Check API endpoint response |
| Performance slow | Enable React Query devtools |

### 💡 Pro Tips

1. **Use the hooks** - Don't fetch data directly
2. **Follow the patterns** - Consistency is key
3. **Test edge cases** - Especially clinical rules
4. **Document changes** - Update this guide!

### 🔗 Resources

- [Full Documentation](./ANC_MODULE_DOCUMENTATION.md)
- [API Reference](./ANC_MODULE_DOCUMENTATION.md#api-reference)
- [Clinical Guidelines](./ANC_MODULE_DOCUMENTATION.md#clinical-decision-support)
- [Component Guide](./ANC_MODULE_DOCUMENTATION.md#component-structure)

---

## For Clinical Users

### Starting an ANC Visit

1. **Select Patient** 
   - Search by name or ID
   - Click patient name

2. **Click ANC Module**
   - From patient dashboard
   - Or main menu

3. **Follow Tab Sequence**
   - Start with Rapid Assessment
   - Move through each tab
   - Save at any point

### Understanding Alerts

🔴 **Red (Critical)** - Immediate action needed
🟠 **Orange (High)** - Urgent attention required  
🟡 **Yellow (Medium)** - Close monitoring
🔵 **Blue (Low)** - Routine follow-up

### Quick Actions

- **Emergency Referral**: Rapid Assessment → Check danger signs → Referral tab
- **HIV+ Patient**: Go directly to PMTCT tab after assessment
- **Lab Results**: Labs tab → Enter results → System auto-evaluates
- **Print Summary**: Click "Print" button on any tab

### Tips for Efficiency

1. **Use keyboard shortcuts**
   - Tab: Move between fields
   - Enter: Submit forms
   - Esc: Close dialogs

2. **Batch enter labs**
   - Enter all results at once
   - System validates automatically

3. **Quick referral**
   - Pre-filled templates available
   - Three-card system guides you

---

*Need help? Contact support team or refer to full documentation*