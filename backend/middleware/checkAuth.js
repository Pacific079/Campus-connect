const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');
    console.log('verify user', verify);
    // attach verified payload for downstream role checks
    req.user = verify;
    next();
  } catch (err) {
    return res.status(401).json({
      msg: 'invalid token please try again',
    });
  }
};
