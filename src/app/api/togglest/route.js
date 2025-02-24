import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API Handler
export async function POST(req) {
    console.log("API Hit");

    try {
        const body = await req.json(); // Read the request body
        const { requestId} = body;

        if (!requestId) {
            return NextResponse.json({ message: "Sanction ID is required" }, { status: 400 });
        }

        console.log("Processing request with ID:", requestId);

        // Fetch the current status
        const sanction = await prisma.sanctiontable.findUnique({
            where: { requestId },
            select: { status: true }
        });

        if (!sanction) {
            return NextResponse.json({ message: "Sanction not found" }, { status: 404 });
        }

        // Toggle status between "completed" and "in progress"
        const newStatus = sanction.status === "completed" ? "in progress" : "completed";

        // Update the database
        const updatedSanction = await prisma.sanctiontable.update({
            where: { requestId },
            data: { status: newStatus }
        });

        return NextResponse.json({ message: "Status updated successfully", sanction: updatedSanction });
    } catch (error) {
        console.error("Error updating sanction status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
