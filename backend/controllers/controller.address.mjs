import { createAddress, getAddresses, updateAddress, deleteAddress } from "../services/service.address.mjs"

export async function create(req, res, next) {
    try {

        const address = await createAddress(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Address created Successfully",
            data: address,
        })

    } catch (error) {
        return next(error);
    }
}


export async function getAll(req, res, next) {
    try {
        const addressess = await getAddresses(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Featched All ",
            data: addressess,
        })

    } catch (error) {
        return next(error);
    }
}

export async function update(req, res, next) {
    try {
        const address = await updateAddress(req.user.id, req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Address updated successfully ",
            data: address,
        })

    } catch (error) {
        return next(error);
    }
}

export async function deleteAddress(req, res, next) {
    try {

        const address = await deleteAddress(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Address Deleetd successfully ",
            data
        })

    } catch (error) {
        return next(error);
    }
}