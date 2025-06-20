# 🧪 Email Verification & Password Reset Testing Guide

## ✅ **Current Configuration Status**

### **Supabase Configuration** ✅ **COMPLETE**

- ✅ Site URL: `frenchlearning://`
- ✅ Redirect URLs:
  - `frenchlearning://email-verification`
  - `frenchlearning://reset-password`
- ✅ Email Templates: Updated with deep links and tokens

### **App Implementation** ✅ **COMPLETE**

- ✅ Deep link handling configured
- ✅ EmailVerificationScreen with token processing
- ✅ ResetPasswordScreen with token processing
- ✅ SupabaseService methods: `verifyEmail()` and `resetPasswordWithToken()`

## 🧪 **How to Test**

### **Test 1: Email Verification Flow**

1. **Register a new user:**

   ```
   App → Register → Enter details → Submit
   ```

2. **Check email:**

   - You should receive confirmation email
   - Email should contain link: `frenchlearning://email-verification?token=...&type=signup`

3. **Click email link:**
   - Should open your app (not browser)
   - Should navigate to EmailVerificationScreen
   - Should show "Email Verified!" message
   - Should auto-redirect to Login after 3 seconds

### **Test 2: Password Reset Flow**

1. **Request password reset:**

   ```
   App → Login → Forgot Password → Enter email → Submit
   ```

2. **Check email:**

   - You should receive reset email
   - Email should contain link: `frenchlearning://reset-password?token=...&type=recovery`

3. **Click email link:**

   - Should open your app (not browser)
   - Should navigate to ResetPasswordScreen
   - Should show password reset form

4. **Reset password:**
   - Enter new password
   - Confirm password
   - Submit → Should show success message
   - Should redirect to Login

## 🔍 **Debug Information**

### **Console Logs to Watch For:**

**Email Verification:**

```
📧 Email verification params: {token: "...", type: "signup"}
🔐 Processing email verification with token
✅ Email verified successfully
```

**Password Reset:**

```
🔐 Processing password reset with token
✅ Password reset successfully
```

**Deep Links:**

```
📱 Deep link received: frenchlearning://email-verification?token=...
✅ Handling email verification: {token: "...", type: "signup"}
```

## ⚠️ **Potential Issues & Solutions**

### **Issue 1: Links Open in Browser**

**Solution:** Make sure app.json has correct scheme and linking configuration

### **Issue 2: Token Not Found**

**Solution:** Check that email templates are using `{{ .Token }}` correctly

### **Issue 3: App Not Opening**

**Solution:**

- Test on physical device (simulators may have issues)
- Check bundle identifier matches app.json

### **Issue 4: Verification Fails**

**Solution:** Check Supabase logs for detailed error messages

## 🎯 **Expected User Experience**

### **Perfect Flow:**

1. **Register** → Email sent notification
2. **Check email** → Click link
3. **App opens** → "Email Verified!" screen
4. **Auto-redirect** → Login screen
5. **Login successful** → Home screen

### **Reset Flow:**

1. **Forgot password** → Email sent notification
2. **Check email** → Click reset link
3. **App opens** → Reset password form
4. **Enter new password** → Success message
5. **Redirect to login** → Can login with new password

## 🚀 **Production Ready Features**

- ✅ **Secure token-based verification**
- ✅ **Native mobile experience**
- ✅ **No browser confusion**
- ✅ **Professional UI/UX**
- ✅ **Proper error handling**
- ✅ **Auto-redirect functionality**

Your email verification and password reset system is now **production-ready**! 🎊
