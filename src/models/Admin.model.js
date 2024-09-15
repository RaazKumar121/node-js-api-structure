const { default: mongoose } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { USER_STATUS } = require("../constants");
const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password must be less than 128 characters long"],
      validate: {
        validator: function (value) {
          // Require at least one uppercase letter, one lowercase letter, one special character and one number
          const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/])[a-zA-Z\d!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/]{8,}$/;
          return regex.test(value);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
      },
    },
    logo: {
      type: String,
      required: false,
    },
    status: {
      type: Number,
      default: USER_STATUS.INACTIVE,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BLOCKED],
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

// Hash password before saving to database
AdminSchema.pre("save", async function (next) {
  const Admin = this;
  if (Admin.isModified("password") || Admin.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(Admin.password, salt);
      Admin.password = hash;
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    return next();
  }
});

// Compare password with hashed password in database
AdminSchema.methods.isPasswordMatched = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// Increment login count when user logs in
AdminSchema.methods.incrementLoginCount = function () {
  this.loginCount += 1;
  return this.save();
};

// Generate a JWT token
AdminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRATE_KEY, {
    // expiresIn: "1d",
  });

  return token;
};

AdminSchema.statics.findByToken = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return this.findById(decoded?.id);
  } catch (err) {
    throw new Error(`Error verifying token: ${err.message}`);
  }
};

AdminSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};
AdminSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.admins || mongoose.model("admins", AdminSchema);

module.exports = Admin;
