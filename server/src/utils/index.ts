import mongoose from 'mongoose';

export const toObjectId = (id: any): mongoose.Types.ObjectId => {
  const str = Array.isArray(id) ? id[0] : String(id);
  return new mongoose.Types.ObjectId(str);
};

export const paramToString = (val: any): string => {
  if (Array.isArray(val)) return String(val[0]);
  return String(val || '');
};
