// API Route for orders management
// GET /api/orders - fetch orders (employees see all, clients see theirs only)
// POST /api/orders - create a new order

export async function GET(request: Request) {
  try {
    // TODO: Get current user from session/JWT token
    // const user = await getCurrentUser();
    // const UserID = user.UserID;
    // const IsAdmin = user.IsAdmin;
    
    // If employee (IsAdmin = 1):
    //   SELECT o.OrderID, o.UserID, o.OrderDate, o.Status, o.TotalAmount,
    //          od.OrderDetailID, od.ItemID, od.Quantity, od.UnitPrice
    //   FROM Orders o
    //   LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
    //   ORDER BY o.OrderDate DESC
    
    // If client (IsAdmin = 0):
    //   SELECT o.OrderID, o.UserID, o.OrderDate, o.Status, o.TotalAmount,
    //          od.OrderDetailID, od.ItemID, od.Quantity, od.UnitPrice
    //   FROM Orders o
    //   LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
    //   WHERE o.UserID = ?
    //   ORDER BY o.OrderDate DESC
    
    return Response.json({
      success: true,
      data: [],
      example: {
        order: {
          OrderID: 1,
          UserID: 1,
          OrderDate: '2024-01-15T10:30:00Z',
          Status: 'Active',
          TotalAmount: 45.98,
        },
        items: [
          {
            OrderDetailID: 1,
            OrderID: 1,
            ItemID: 1,
            Quantity: 2,
            UnitPrice: 14.99,
          }
        ]
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Implement order creation with database transaction
    // 1. Get current UserID from session/JWT
    // 2. Validate required fields: items (array of {ItemID, Quantity})
    // 3. Calculate TotalAmount from items
    // 4. INSERT INTO Orders (UserID, OrderDate, Status, TotalAmount)
    //    VALUES (?, NOW(), 'Active', ?)
    // 5. For each item, INSERT INTO OrderDetails (OrderID, ItemID, Quantity, UnitPrice)
    // 6. Return created order with OrderID
    
    const { items } = body; // Array of {ItemID, Quantity}
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    // Validate each item has ItemID and Quantity
    const validItems = items.every(item => item.ItemID && item.Quantity);
    if (!validItems) {
      return Response.json(
        { success: false, error: 'Each item must have ItemID and Quantity' },
        { status: 400 }
      );
    }
    
    return Response.json(
      {
        success: true,
        message: 'Order created successfully',
        data: {
          OrderID: null, // Will be set by database
          UserID: null, // Will be set from current user
          OrderDate: new Date().toISOString(),
          Status: 'Active',
          TotalAmount: null, // Will be calculated
          items: items
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
