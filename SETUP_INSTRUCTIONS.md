# VoterImpact Setup Instructions

## 🔐 Supabase Setup (Required)

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com) and sign up (free tier)
2. Create a new project
3. Choose a region close to your users

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (starts with: `eyJhbGciOiJIUzI1NiIs...`)

### 3. Configure Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder values:
```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 4. Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql` 
3. Run the query to create your database tables

### 5. Configure Authentication
1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Set up email templates under **Auth** > **Email Templates**

## 🚀 Running the App

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open your browser:**
- Go to `http://localhost:3000`
- You should see the login screen

## 🔄 User Flow

1. **Sign Up:** Create an account with email/password
2. **Email Verification:** Check email and click confirmation link
3. **Profile Setup:** Complete your profile with personal information
4. **Browse Legislation:** View personalized legislation impact cards

## 🛡️ Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Authentication Required** - All app features require login
✅ **Secure Data Storage** - No sensitive data in localStorage
✅ **Input Validation** - Forms validate data before submission

## 📱 Features

- **Mobile-first design** with responsive layout
- **Real-time authentication** with Supabase Auth
- **Secure profile management** stored in cloud database
- **Personalized legislation tracking** based on user profile
- **Filter system** for different policy categories

## 🔧 Development Notes

- Uses **Create React App** with **Tailwind CSS**
- **Supabase** handles authentication and database
- **React Context** manages global auth state
- **Row Level Security** ensures data privacy

## 🐛 Troubleshooting

**"Invalid API key" error:**
- Check your `.env` file has correct Supabase credentials
- Restart the development server after changing `.env`

**Database connection issues:**
- Ensure you've run the `supabase-schema.sql` script
- Check your Supabase project is active (not paused)

**Email confirmation not working:**
- Check spam folder
- Verify email templates are configured in Supabase

## 📞 Support

- Review Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Check React documentation: [reactjs.org](https://reactjs.org)