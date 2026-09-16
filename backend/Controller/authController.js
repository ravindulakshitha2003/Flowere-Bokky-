import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'



// ---- POST /api/auth/login ----
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // password is select:false on the schema, so it must be explicitly requested
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const passwordCorrect =await bcrypt.compare(
        password,
        user.password
    )
    
     if (!passwordCorrect) {

            return res.status(401).json({
                message: "Invalid username or password"
            });

        }

        const token = generateToken(user);
        res.status(200).json({
                 message: 'Logged in successfully.',
                token: token
      
    
    })
  } catch (err) {
    console.error('loginUser error:', err)
    res.status(500).json({ message: 'Something went wrong while logging in.' })
  }
}