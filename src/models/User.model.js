const { default: mongoose } = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { USER_STATUS } = require("../constants");
const UserSchema = new mongoose.Schema(
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
    mobile: {
      type: Number,
      required: true,
    },
    referer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    referer_code: {
      type: String,
      required: false,
    },
    refercode: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: "0",
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

// Increment login count when user logs in
UserSchema.methods.incrementLoginCount = function () {
  this.loginCount += 1;
  return this.save();
};

// Generate a JWT token
UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRATE_KEY, {
    // expiresIn: "1d",
  });

  return token;
};

UserSchema.statics.findByToken = function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return this.findById(decoded?.id);
  } catch (err) {
    throw new Error(`Error verifying token: ${err.message}`);
  }
};

const User = mongoose.models.users || mongoose.model("users", UserSchema);

module.exports = User;
