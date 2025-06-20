# Email Verification & Password Reset Setup Guide

## 🔧 **Supabase Configuration Required**

### **Step 1: Configure Redirect URLs in Supabase Dashboard**

1. **Go to Supabase Dashboard** → Your Project → Authentication → URL Configuration

2. **Add Redirect URLs:**

   ```
   frenchlearning://email-verification
   frenchlearning://reset-password
   ```

3. **Site URL:** Set to your domain or `frenchlearning://`

### **Step 2: Email Templates (Optional Enhancement)**

In Supabase Dashboard → Authentication → Email Templates:

**Confirmation Email Template:**

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

**Password Reset Email Template:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

## 📱 **How It Works**

### **Email Verification Flow:**

```
1. User registers → Gets confirmation email
2. User clicks email link → Opens app (frenchlearning://email-verification)
3. App navigates to EmailVerificationScreen
4. Shows success message → Redirects to Login
```

### **Password Reset Flow:**

```
1. User requests reset → Gets reset email
2. User clicks email link → Opens app (frenchlearning://reset-password)
3. App navigates to ResetPasswordScreen
4. User enters new password → Success → Redirects to Login
```

## 🚀 **Deep Link Handling**

The app is configured with:

- **Scheme:** `frenchlearning://`
- **Bundle ID:** `com.yourcompany.frenchlearningapp`
- **Deep Link Prefixes:** Configured in app.json

## ✨ **User Experience**

### **Seamless Flow:**

- ✅ Email verification happens in-app
- ✅ Password reset happens in-app
- ✅ No browser confusion
- ✅ Smooth user experience
- ✅ Native app feel

### **Fallback Handling:**

- ✅ Error states for failed verification
- ✅ Resend email functionality
- ✅ Clear user feedback
- ✅ Graceful error recovery

## 🔒 **Security Features**

- ✅ Secure token-based verification
- ✅ Time-limited reset links
- ✅ Proper session management
- ✅ Password strength validation

This implementation provides a professional, user-friendly email verification and password reset system that works seamlessly within your mobile app!
