// API Route for individual order management
// GET /api/orders/[id] - fetch a specific order with details
// PUT /api/orders/[id] - update order status (employee only)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Implement database query
    // SELECT o.OrderID, o.UserID, o.OrderDate, o.Status, o.TotalAmount,
    //        od.OrderDetailID, od.ItemID, od.Quantity, od.UnitPrice
    // FROM Orders o
    // LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
    // WHERE o.OrderID = ?
    
    return Response.json({
      success: true,
      data: {
        order: {
          OrderID: id,
          UserID: null,
          OrderDate: null,
          Status: 'Active',
          TotalAmount: null,
        },
        items: []
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // TODO: Implement with database update
    // 1. Get current user and verify IsAdmin = 1 (employee only)
    // 2. Validate Status is one of: 'Active', 'Completed', 'Cancelled'
    // 3. UPDATE Orders SET Status = ? WHERE OrderID = ?
    // 4. Return updated order
    
    const validStatuses = ['Active', 'Completed', 'Cancelled'];
    
    if (!body.Status) {
      return Response.json(
        { success: false, error: 'Status field is required' },
        { status: 400 }
      );
    }
    
    if (!validStatuses.includes(body.Status)) {
      return Response.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    // TODO: Verify current user is employee (IsAdmin = 1)
    // if (!user.IsAdmin) {
    //   return Response.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    // }
    
    return Response.json({
      success: true,
      message: 'Order status updated',
      data: {
        OrderID: id,
        Status: body.Status,
        UpdatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
