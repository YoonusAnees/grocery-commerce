import { createAddress, getAddresses, updateAddress, deleteAddress } from "../services/service.address.mjs";

export async function create(req, res, next) {
    try {
        const address = await createAddress(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: address,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getAll(req, res, next) {
    try {
        const addresses = await getAddresses(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Fetched all addresses",
            data: addresses,
        });
    } catch (error) {
        return next(error);
    }
}

export async function update(req, res, next) {
    try {
        const address = await updateAddress(req.user.id, req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });
    } catch (error) {
        return next(error);
    }
}

export async function remove(req, res, next) {
    try {
        const address = await deleteAddress(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            data: address,
        });
    } catch (error) {
        return next(error);
    }
}
