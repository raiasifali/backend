//imports
const authModel = require('../../models/auth/auth');
const jwt = require('jsonwebtoken');
// const bcrypt=require('bcrypt')
const nodemailer = require('nodemailer');
const adminmodel = require('../../models/admin/admin');
const playerModel = require('../../models/player/player');

module.exports.register = async (req, res) => {
  let { email, password, firstName, lastName, phoneNumber, role } = req.body;
  try {
    let alreadyExists = await authModel.findOne({ email });
    if (alreadyExists) {
      return res.status(400).json({
        error: 'Email already exists',
      });
    }
    if (
      email.length == 0 ||
      password.length == 0 ||
      firstName.length == 0 ||
      role.length == 0 ||
      phoneNumber.length == 0 ||
      lastName.length == 0
    ) {
      return res.status(400).json({
        message:
          'Please provide email,password,firstName,lastName,phoneNumber,role',
      });
    }

    // let hashedPassword=await bcrypt.hash(password,10)

    let jwtToken = await jwt.sign(
      { email, password, firstName, lastName, phoneNumber, role },
      process.env.JWT_TOKEN,
      { expiresIn: '15m' }
    );
    const emailHtmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  .header {
    color: #333;
    text-align: center;
  }
  .review {
    background-color: #f9f9f9;
    border-left: 4px solid #007BFF;
    margin: 20px 0;
    padding: 20px;
    border-radius: 4px;
  }
  .rating {
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    color: #ff9500;
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h2>Welcome to Our Platform</h2>
  </div>
  <div class="review">
    <p>Hello,</p>
    <p>Welcome to our platform! We are thrilled to have you on board.</p>
   
  </div>
  <div>
   <p>Please click on the link to verify email</p>
   <a href="https://dawar.vercel.app/verify/${jwtToken}">https://dawar.vercel.app/verify/${jwtToken}</a>
  </div>
</div>

</body>
</html>
`;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.user_email,
        pass: process.env.pass_email,
      },
    });
    const mailOptions = {
      from: process.env.user_email,
      to: email,
      subject: 'Account verification',
      html: emailHtmlContent,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('Error sending email:', error);
      }
      if (info) {
        console.log(info);
        return res.status(200).json({
          message: 'Email verification sent successfully',
        });
      }
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error please retry',
    });
  }
};

module.exports.emailVerification = async (req, res) => {
  let { token } = req.params;
  try {
    let userData = await jwt.verify(token, process.env.JWT_TOKEN);

    await authModel.create({
      email: userData.email,
      name: userData.firstName + ' ' + userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      password: userData.password,
    });
    return res.status(200).json({
      message: 'User registered sucessfully',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error please retry',
    });
  }
};

module.exports.login = async (req, res) => {
  let { email, password } = req.body;
  try {
    let emailFound = await authModel.findOne({ email });

    if (!emailFound) {
      return res.status(400).json({
        error: 'Email not found',
      });
    }
    emailFound = emailFound.toObject();
    // let passwordMatch=await bcrypt.compare(password,emailFound.password)
    let passwordMatch = emailFound.password == password ? true : false;
    if (passwordMatch) {
      let token = await jwt.sign(emailFound, process.env.JWT_TOKEN);
      let userData = {
        ...emailFound,
        token,
      };
      return res.status(200).json({
        message: 'User logged in successfully',
        userData,
      });
    }
    return res.status(400).json({
      error: 'Incorrect password',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error please retry',
    });
  }
};
module.exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userExists = await authModel.findOne({ email });
    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const token = jwt.sign({ id: userExists._id }, process.env.JWT_TOKEN, {
      expiresIn: '1h',
    });
    const emailHtmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  .header {
    color: #333;
    text-align: center;
  }
  .review {
    background-color: #f9f9f9;
    border-left: 4px solid #007BFF;
    margin: 20px 0;
    padding: 20px;
    border-radius: 4px;
  }
  .rating {
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    color: #ff9500;
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h2>Password Reset Request</h2>
  </div>
  <div class="review">
    <p>Hello,</p>
    <p>You requested a password reset. Please click on the link below to reset your password:</p>
  </div>
  <div>
   <p><a href="https://dawar.vercel.app/change-password/${token}">Reset Password</a></p>
  </div>
</div>

</body>
</html>
`;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Reset Password',
      html: emailHtmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};

module.exports.changePassword = async (req, res) => {
  let { password, token } = req.body;

  try {
    let userData = await jwt.verify(token, process.env.JWT_TOKEN);

    await authModel.findByIdAndUpdate(userData.id, {
      password: password,
    });
    return res.status(200).json({
      message: 'Password changed sucessfully',
    });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};

module.exports.adminRegister = async (req, res) => {
  let { email, password } = req.body;
  try {
    await adminmodel.create({
      email,
      password,
    });
    return res.status(200).json({
      message: 'Admin registered successfully',
    });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};

module.exports.adminLogin = async (req, res) => {
  let { email, password } = req.body;
  try {
    let emailmatch = await adminmodel.findOne({ email });
    if (!emailmatch) {
      return res.status(400).json({
        error: 'Invalid email',
      });
    }
    let passwordMatch = await adminmodel.findOne({ password });
    if (!passwordMatch) {
      return res.status(400).json({
        error: 'Invalid password',
      });
    }
    return res.status(200).json({
      message: 'Successfully logged in',
    });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};
module.exports.addRemoveFavourites = async (req, res) => {
  let { id } = req.params;

  try {
    let player = await playerModel.findOne({ _id: id });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    let alreadyFavourite = player.favouriteBy.includes(req.user._id);

    if (alreadyFavourite) {
      await playerModel.updateOne(
        { _id: id },
        { $pull: { favouriteBy: req.user._id } }
      );
      return res.status(200).json({
        message: 'Favourite player removed',
      });
    } else {
      await playerModel.updateOne(
        { _id: id },
        { $push: { favouriteBy: req.user._id } }
      );
      return res.status(200).json({
        message: 'Favourite player added',
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};
