#!/bin/bash

# Setup Script for HOC Frontend + Backend Integration
# Run this after completing manual Firebase setup

echo "🚀 HOC Integration Setup"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the exercises/hoc directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Enable Google Sign-In in Firebase Console:"
echo "   https://console.firebase.google.com"
echo "   → Authentication → Sign-in method → Enable Google"
echo ""
echo "2. Create admin user in Firebase Console:"
echo "   → Authentication → Users → Add User"
echo "   → Copy the UID"
echo ""
echo "3. Seed admin user in backend:"
echo "   cd ../hoc-backend"
echo "   source venv/bin/activate"
echo "   # Edit seed_admin.py with your UID"
echo "   python seed_admin.py"
echo ""
echo "4. Start backend server:"
echo "   cd ../hoc-backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "5. Start frontend (in this directory):"
echo "   npm run dev"
echo ""
echo "6. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "🎉 Ready to test Google Sign-In!"
