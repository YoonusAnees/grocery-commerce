import mongoose from "mongoose";
import { Address } from "../models/model.address.mjs";
import { AppError } from "../utils/AppError.mjs";
import { addressSchema } from "../validations/validation.address.mjs";


function validateInput(input) {
  const result = addressSchema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0].message,
      400,
      "VALIDATION_ERROR",
    );
  }

  return result.data;
}

function validateId(id) {
  if (
    typeof id !== "string" ||
    !mongoose.isObjectIdOrHexString(id)
  ) {
    throw new AppError(
      "Invalid address ID",
      400,
      "VALIDATION_ERROR",
    );
  }
}

function toAddressResponse(address) {
  return {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
  };
}

export async function createAddress(userId, input) {
  const data = validateInput(input);

  const address = await Address.create({
    ...data,
    user: userId,
  });

  return toAddressResponse(address);
}

export async function getAddresses(userId) {
  const addresses = await Address.find({ user: userId })
    .sort({ createdAt: -1, _id: -1 });

  return addresses.map(toAddressResponse);
}

export async function updateAddress(userId, id, input) {
  validateId(id);

  const data = validateInput(input);

  const address = await Address.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!address) {
    throw new AppError(
      "Address not found",
      404,
      "ADDRESS_NOT_FOUND",
    );
  }

  return toAddressResponse(address);
}

export async function deleteAddress(userId, id) {
  validateId(id);

  const address = await Address.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!address) {
    throw new AppError(
      "Address not found",
      404,
      "ADDRESS_NOT_FOUND",
    );
  }

  return { id: address.id };
}

