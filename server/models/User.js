import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { _id: this._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ 'tokens.token': 1 });

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;