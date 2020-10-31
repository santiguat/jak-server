import userModel from '../models/user.model';

export const findOne = <T>(param: T, callback?: (res: any) => void): T => {
  let result: T;
  userModel.findOne(param, (err, res: T) => {
    if (err) {
      console.log(err);
      return;
    }
    callback(res);
    result = res;
  });
  return result;
};
