import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Resistors' },
      update: {},
      create: {
        name: 'Resistors',
        description: 'Electronic resistors of various values and power ratings'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Capacitors' },
      update: {},
      create: {
        name: 'Capacitors',
        description: 'Electronic capacitors including ceramic, electrolytic, and film types'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Inductors' },
      update: {},
      create: {
        name: 'Inductors',
        description: 'Electronic inductors and coils'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Diodes' },
      update: {},
      create: {
        name: 'Diodes',
        description: 'Various types of diodes including rectifier, LED, and Zener diodes'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Transistors' },
      update: {},
      create: {
        name: 'Transistors',
        description: 'BJT, MOSFET, and other transistor types'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Integrated Circuits (ICs)' },
      update: {},
      create: {
        name: 'Integrated Circuits (ICs)',
        description: 'Microchips, amplifiers, logic ICs, and other integrated circuits'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Connectors' },
      update: {},
      create: {
        name: 'Connectors',
        description: 'Headers, sockets, and various connection components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Sensors' },
      update: {},
      create: {
        name: 'Sensors',
        description: 'Temperature, humidity, motion, and other sensor modules'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Microcontrollers/Development Boards' },
      update: {},
      create: {
        name: 'Microcontrollers/Development Boards',
        description: 'Arduino, Raspberry Pi, ESP32, and other development boards'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Switches/Buttons' },
      update: {},
      create: {
        name: 'Switches/Buttons',
        description: 'Toggle switches, push buttons, and other switching components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'LEDs/Displays' },
      update: {},
      create: {
        name: 'LEDs/Displays',
        description: 'LEDs, LCD displays, OLED screens, and display modules'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cables/Wires' },
      update: {},
      create: {
        name: 'Cables/Wires',
        description: 'Jumper wires, USB cables, and various wiring components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Mechanical Parts/Hardware' },
      update: {},
      create: {
        name: 'Mechanical Parts/Hardware',
        description: 'Screws, nuts, bolts, enclosures, and mechanical components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Miscellaneous Lab Supplies' },
      update: {},
      create: {
        name: 'Miscellaneous Lab Supplies',
        description: 'Breadboards, soldering supplies, and other lab equipment'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create a test user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@lab.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@lab.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  })

  console.log('✅ Test user created')

  // Create sample components with INR pricing
  const components = await Promise.all([
    prisma.component.upsert({
      where: { partNumber: 'RES-1K-1W' },
      update: {},
      create: {
        name: '1K Ohm 1W Resistor',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'RES-1K-1W',
        description: '1K Ohm carbon film resistor, 1W power rating',
        quantity: 100,
        locationBin: 'Shelf A1, Bin 1',
        unitPrice: 2.50, // INR
        criticalLowThreshold: 20,
        categoryId: categories[0].id, // Resistors
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'CAP-100UF-25V' },
      update: {},
      create: {
        name: '100µF 25V Electrolytic Capacitor',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'CAP-100UF-25V',
        description: '100 microfarad electrolytic capacitor, 25V rating',
        quantity: 50,
        locationBin: 'Shelf A1, Bin 2',
        unitPrice: 5.00, // INR
        criticalLowThreshold: 10,
        categoryId: categories[1].id, // Capacitors
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'LED-RED-5MM' },
      update: {},
      create: {
        name: '5mm Red LED',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'LED-RED-5MM',
        description: '5mm red LED, 20mA forward current',
        quantity: 200,
        locationBin: 'Shelf B1, Bin 1',
        unitPrice: 3.00, // INR
        criticalLowThreshold: 30,
        categoryId: categories[10].id, // LEDs/Displays
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'ARDUINO-UNO-R3' },
      update: {},
      create: {
        name: 'Arduino Uno R3',
        manufacturer: 'Arduino',
        supplier: 'Robu.in',
        partNumber: 'ARDUINO-UNO-R3',
        description: 'Arduino Uno R3 development board with ATmega328P',
        quantity: 10,
        locationBin: 'Shelf C1, Bin 1',
        unitPrice: 450.00, // INR
        criticalLowThreshold: 2,
        categoryId: categories[8].id, // Microcontrollers/Development Boards
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'DHT22-SENSOR' },
      update: {},
      create: {
        name: 'DHT22 Temperature & Humidity Sensor',
        manufacturer: 'Aosong',
        supplier: 'Robu.in',
        partNumber: 'DHT22-SENSOR',
        description: 'Digital temperature and humidity sensor module',
        quantity: 15,
        locationBin: 'Shelf D1, Bin 1',
        unitPrice: 180.00, // INR
        criticalLowThreshold: 5,
        categoryId: categories[7].id, // Sensors
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'DUPONT-40-PIN' },
      update: {},
      create: {
        name: '40-Pin Dupont Jumper Wires',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'DUPONT-40-PIN',
        description: '40-pin male-to-female jumper wire set',
        quantity: 25,
        locationBin: 'Shelf E1, Bin 1',
        unitPrice: 35.00, // INR
        criticalLowThreshold: 5,
        categoryId: categories[11].id, // Cables/Wires
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'BREADBOARD-830' },
      update: {},
      create: {
        name: '830 Point Breadboard',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'BREADBOARD-830',
        description: '830 point solderless breadboard for prototyping',
        quantity: 8,
        locationBin: 'Shelf F1, Bin 1',
        unitPrice: 120.00, // INR
        criticalLowThreshold: 2,
        categoryId: categories[13].id, // Miscellaneous Lab Supplies
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'TRANS-2N2222' },
      update: {},
      create: {
        name: '2N2222 NPN Transistor',
        manufacturer: 'ON Semiconductor',
        supplier: 'Electronics Hub',
        partNumber: 'TRANS-2N2222',
        description: 'General purpose NPN transistor, 40V, 600mA',
        quantity: 75,
        locationBin: 'Shelf A2, Bin 1',
        unitPrice: 8.00, // INR
        criticalLowThreshold: 15,
        categoryId: categories[4].id, // Transistors
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'IC-555-TIMER' },
      update: {},
      create: {
        name: '555 Timer IC',
        manufacturer: 'Texas Instruments',
        supplier: 'Electronics Hub',
        partNumber: 'IC-555-TIMER',
        description: 'NE555 timer IC, 8-pin DIP package',
        quantity: 30,
        locationBin: 'Shelf A2, Bin 2',
        unitPrice: 12.00, // INR
        criticalLowThreshold: 8,
        categoryId: categories[5].id, // Integrated Circuits (ICs)
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'DIODE-1N4007' },
      update: {},
      create: {
        name: '1N4007 Rectifier Diode',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'DIODE-1N4007',
        description: '1A, 1000V rectifier diode',
        quantity: 60,
        locationBin: 'Shelf A2, Bin 3',
        unitPrice: 4.00, // INR
        criticalLowThreshold: 12,
        categoryId: categories[3].id, // Diodes
        createdBy: user.id
      }
    }),
    // Add some components with low stock for testing alerts
    prisma.component.upsert({
      where: { partNumber: 'RES-10K-1W' },
      update: {},
      create: {
        name: '10K Ohm 1W Resistor',
        manufacturer: 'Generic',
        supplier: 'Electronics Hub',
        partNumber: 'RES-10K-1W',
        description: '10K Ohm carbon film resistor, 1W power rating',
        quantity: 5, // Low stock
        locationBin: 'Shelf A1, Bin 3',
        unitPrice: 2.50, // INR
        criticalLowThreshold: 20,
        categoryId: categories[0].id, // Resistors
        createdBy: user.id
      }
    }),
    prisma.component.upsert({
      where: { partNumber: 'ESP32-DEVKIT' },
      update: {},
      create: {
        name: 'ESP32 Development Board',
        manufacturer: 'Espressif',
        supplier: 'Robu.in',
        partNumber: 'ESP32-DEVKIT',
        description: 'ESP32 WiFi + Bluetooth development board',
        quantity: 0, // Out of stock
        locationBin: 'Shelf C1, Bin 2',
        unitPrice: 350.00, // INR
        criticalLowThreshold: 3,
        categoryId: categories[8].id, // Microcontrollers/Development Boards
        createdBy: user.id
      }
    })
  ])

  console.log('✅ Sample components created')

  // Create sample transactions with different dates for analytics
  const transactions = await Promise.all([
    // Recent transactions (current month)
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 100,
        reason: 'Initial stock',
        project: 'Inventory Setup',
        componentId: components[0].id,
        userId: user.id,
        createdAt: new Date('2024-01-15T10:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 5,
        reason: 'IoT project',
        project: 'Smart Home System',
        componentId: components[0].id,
        userId: user.id,
        createdAt: new Date('2024-01-14T14:30:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 10,
        reason: 'Restock',
        project: 'Inventory Management',
        componentId: components[3].id,
        userId: user.id,
        createdAt: new Date('2024-01-13T09:15:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 2,
        reason: 'Research project',
        project: 'Sensor Network',
        componentId: components[4].id,
        userId: user.id,
        createdAt: new Date('2024-01-12T16:45:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 50,
        reason: 'Bulk order',
        project: 'Component Restock',
        componentId: components[1].id,
        userId: user.id,
        createdAt: new Date('2024-01-11T11:20:00Z')
      }
    }),
    
    // Previous month transactions
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 15,
        reason: 'Production batch',
        project: 'LED Display Project',
        componentId: components[2].id,
        userId: user.id,
        createdAt: new Date('2023-12-20T13:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 25,
        reason: 'Monthly restock',
        project: 'Inventory Management',
        componentId: components[2].id,
        userId: user.id,
        createdAt: new Date('2023-12-15T10:30:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 8,
        reason: 'Educational project',
        project: 'Student Workshop',
        componentId: components[3].id,
        userId: user.id,
        createdAt: new Date('2023-12-10T15:45:00Z')
      }
    }),
    
    // Two months ago transactions
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 30,
        reason: 'Quarterly restock',
        project: 'Inventory Management',
        componentId: components[5].id,
        userId: user.id,
        createdAt: new Date('2023-11-25T09:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 12,
        reason: 'Prototyping',
        project: 'IoT Prototype',
        componentId: components[5].id,
        userId: user.id,
        createdAt: new Date('2023-11-20T14:20:00Z')
      }
    }),
    
    // Three months ago transactions (for old stock testing)
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 20,
        reason: 'Initial stock',
        project: 'Inventory Setup',
        componentId: components[6].id,
        userId: user.id,
        createdAt: new Date('2023-10-15T11:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 3,
        reason: 'Testing',
        project: 'Circuit Testing',
        componentId: components[6].id,
        userId: user.id,
        createdAt: new Date('2023-10-10T16:30:00Z')
      }
    }),
    
    // Four months ago transactions
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 40,
        reason: 'Bulk purchase',
        project: 'Component Stock',
        componentId: components[7].id,
        userId: user.id,
        createdAt: new Date('2023-09-20T10:15:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 10,
        reason: 'Production',
        project: 'Amplifier Project',
        componentId: components[7].id,
        userId: user.id,
        createdAt: new Date('2023-09-15T13:45:00Z')
      }
    }),
    
    // Five months ago transactions
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 15,
        reason: 'Restock',
        project: 'Inventory Management',
        componentId: components[8].id,
        userId: user.id,
        createdAt: new Date('2023-08-25T12:00:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 5,
        reason: 'Timing circuit',
        project: 'Timer Project',
        componentId: components[8].id,
        userId: user.id,
        createdAt: new Date('2023-08-20T15:30:00Z')
      }
    }),
    
    // Six months ago transactions
    prisma.transaction.create({
      data: {
        type: 'INWARD',
        quantity: 25,
        reason: 'Initial stock',
        project: 'Inventory Setup',
        componentId: components[9].id,
        userId: user.id,
        createdAt: new Date('2023-07-30T09:45:00Z')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'OUTWARD',
        quantity: 8,
        reason: 'Power supply',
        project: 'Power Supply Project',
        componentId: components[9].id,
        userId: user.id,
        createdAt: new Date('2023-07-25T14:15:00Z')
      }
    })
  ])

  console.log('✅ Sample transactions created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 