import {validationResult} from "express-validator" 

export default function validateResults(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errMsgs=[];
    errors.array().forEach(err => {
      errMsgs=[...errMsgs,err.msg]
    });
    console.log(errMsgs)
    return res.status(400).json({
      error: errMsgs
    });
  }
  next();
}

