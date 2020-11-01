import { UserModel } from '../models/user.model';

export const findOne = <T>(filter: T, callback?: (res: any) => void): T => {
  let result: T;
  UserModel.findOne(filter, (err, res: T) => {
    if (err) {
      console.log(err);
      return;
    }
    callback(res);
    result = res;
  });
  return result;
};
