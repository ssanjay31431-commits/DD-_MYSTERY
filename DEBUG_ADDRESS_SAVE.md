# Address Save Error Debugging Guide

## Common Issues & Solutions

### Issue 1: "Failed to save address" - Not Authenticated
**Symptom**: User is logged in but address won't save
**Solution**: 
- Check browser console (F12) for network errors
- Look at the Network tab to see the API response
- Ensure you're logged in (check localStorage for `dd_user_info`)

**To test authentication:**
```
Open browser console and run:
fetch('/api/auth/health', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('dd_user_info')).token}`
  }
}).then(r => r.json()).then(d => console.log(d))
```

---

### Issue 2: Validation Errors
**Symptom**: Form validation error toast appears
**Check**:
- ✅ All required fields are filled (Name, Phone, House, Street, Area, City, State, Pincode)
- ✅ Mobile number is 10 digits: `7708447215` ✓
- ✅ Pincode is 6 digits: `609702` ✓

---

### Issue 3: Database Connection Error
**Symptom**: All fields filled, still fails
**Check MongoDB**:
```
mongosh
use dd_mystery_box
db.addresses.find({})
```

---

### Issue 4: Server Not Running
**Symptom**: "Failed to reach server" or network timeout
**Solution**:
```
cd server
npm start
```
Should see: `[DD Mystery Box Server] Running in development mode on port 5000`

---

## Improved Error Handling
The error messages now show:
1. **Missing fields**: Lists exactly which fields are missing
2. **Invalid pincode**: Must be exactly 6 digits
3. **Invalid mobile**: Must be exactly 10 digits  
4. **Database errors**: Shows the actual validation error from MongoDB
5. **Auth errors**: "Not authorized" if token is missing/invalid

---

## Browser Console Debugging

1. **Check if logged in:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('dd_user_info')))
   ```

2. **Check form data before submit:**
   - Open Network tab (F12 → Network)
   - Click "Save Address & Continue"
   - Look at the POST /api/addresses request
   - Check the Request body and Response

3. **Check for exact error:**
   - Response should show message like:
   - `"Pincode must be 6 digits"`
   - `"Mobile number must be 10 digits"`
   - `"Missing required fields: ..."`

---

## What's Been Fixed

✅ Better error messages from backend  
✅ Validation for pincode (6 digits)  
✅ Validation for mobile (10 digits)  
✅ Proper default values for optional fields  
✅ Better error logging in console  
✅ Auth health check endpoint added  

---

## Next Steps

If issue persists:
1. Check server logs (terminal running `npm start`)
2. Verify MongoDB is running
3. Clear localStorage and re-login
4. Check browser console for network errors
5. Verify all fields are actually filled (not just appearing filled)
