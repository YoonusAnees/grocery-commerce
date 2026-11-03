import mongoose from "mongoose";
import { Address } from "../models/model.address.mjs";
import { AppError } from "../utils/AppError.mjs";
import { addressSchema } from "../validations/validation.address.mjs";


function validateInput(data) {
    const valiDate = addressSchema.safeParse(data);
    if (!result.success) {
        throw new AppError(
            result.error.issues[0].message,
            400,
            "VALIDATION_ERROR"
        );
    };

    return result.valiDate;
}


function validDateId(id) {
    if (typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) {
        throw new AppError(
            "Invalid Address ID",
            400,
            "VALIDATION_ERROR"
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
        country: address.country

    };
}

export async function createAddress(userId, data) {
    const valiDate = validateInput(data);
    const address = await Address.create({
        ...valiDate,
        user: userId
    });

    return toAddressResponse(address);
}

export async function getAddresses(userId) {
    const addressess = await Address.find({
        user: userId
    }).sort({
        createdAt: -1, _id: -1
    });
    return addressess.map(toAddressResponse);
}

export async function updateAddress(userId, Id, data) {
    validDateId(Id);
    const valiData = validateInput(data);
    const address = await Address.findOneAndUpdate({
        _id: Id,
        user: userId
    },
        { $set: valiData },

        {
            new: true,
            runvalidators: true
        },
    );
    if (!address) {
        throw new AppError(
            "Address not found",
            404,
            "ADDRESS_NOT_FOUND"
        );
    }

    return toAddressResponse(address);
}


export async function deleteAddress(userId, id) {
    validDateId(id);
    const address = await Address.findOneAndDelete({
        _id: id,
        user: userId
    });

    if (!address) {
        throw new AppError(
            "Address Not Found",
            404,
            "ADDRESS_NOT_FOUND"
        )
    }

    return {
        id: address.id
    }
}

