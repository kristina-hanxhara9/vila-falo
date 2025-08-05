#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function debugRoomAvailability() {
    console.log('🔍 DEBUGGING ROOM AVAILABILITY ISSUE');
    console.log('====================================\n');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        console.log('✅ Database connected\n');
        
        // Check all current bookings
        console.log('📊 ALL CURRENT BOOKINGS:');
        const allBookings = await Booking.find({ status: { $ne: 'cancelled' } })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${allBookings.length} active bookings:\n`);
        
        const roomTypeCounts = {};
        
        allBookings.forEach((booking, index) => {
            console.log(`${index + 1}. Booking ID: ${booking._id}`);
            console.log(`   Guest: ${booking.guestName}`);
            console.log(`   Email: ${booking.email}`);
            console.log(`   Room Type: "${booking.roomType}"`);
            console.log(`   Rooms Booked: ${booking.roomsBooked || 'NOT SET (defaulting to 1)'}`);
            console.log(`   Check-in: ${booking.checkInDate}`);
            console.log(`   Check-out: ${booking.checkOutDate}`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   Source: ${booking.source}`);
            console.log(`   Created: ${booking.createdAt}`);
            console.log('');
            
            // Count by room type
            const roomType = booking.roomType;
            if (!roomTypeCounts[roomType]) {
                roomTypeCounts[roomType] = 0;
            }
            roomTypeCounts[roomType] += (booking.roomsBooked || 1);
        });
        
        console.log('📊 ROOM TYPE SUMMARY:');
        console.log('===================');
        Object.entries(roomTypeCounts).forEach(([roomType, count]) => {
            console.log(`${roomType}: ${count} room(s) booked`);
        });
        
        console.log('\n🏨 ROOM INVENTORY:');
        console.log('Standard: 5 total');
        console.log('Deluxe: 4 total');
        console.log('Suite: 3 total');
        
        console.log('\n📈 AVAILABILITY CALCULATION:');
        const roomInventory = {
            'Standard': 5,
            'Deluxe': 4,
            'Suite': 3
        };
        
        Object.entries(roomInventory).forEach(([roomType, total]) => {
            const booked = roomTypeCounts[roomType] || 0;
            const available = total - booked;
            console.log(`${roomType}: ${available}/${total} available (${booked} booked)`);
        });
        
        // Check for duplicate bookings
        console.log('\n🔍 CHECKING FOR DUPLICATES:');
        const duplicateCheck = await Booking.aggregate([
            {
                $match: { status: { $ne: 'cancelled' } }
            },
            {
                $group: {
                    _id: {
                        email: '$email',
                        checkInDate: '$checkInDate',
                        checkOutDate: '$checkOutDate',
                        roomType: '$roomType'
                    },
                    count: { $sum: 1 },
                    bookings: { $push: { id: '$_id', guest: '$guestName', created: '$createdAt' } }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);
        
        if (duplicateCheck.length > 0) {
            console.log('❌ FOUND DUPLICATE BOOKINGS:');
            duplicateCheck.forEach(dup => {
                console.log(`Email: ${dup._id.email}`);
                console.log(`Room: ${dup._id.roomType}`);
                console.log(`Dates: ${dup._id.checkInDate} to ${dup._id.checkOutDate}`);
                console.log(`Count: ${dup.count} duplicate bookings`);
                console.log('Booking IDs:', dup.bookings.map(b => b.id));
                console.log('');
            });
        } else {
            console.log('✅ No duplicate bookings found');
        }
        
        console.log('\n🎯 DIAGNOSIS:');
        if (roomTypeCounts['Standard'] > 1) {
            console.log('❌ ISSUE CONFIRMED: Multiple Standard room bookings are blocking all rooms');
            console.log('💡 SOLUTION: Each booking should only block 1 room, not all rooms of that type');
        } else {
            console.log('✅ Room availability logic appears correct');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run debug
debugRoomAvailability().catch(console.error);
