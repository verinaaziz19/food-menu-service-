// API Route for individual menu item management
// GET /api/menu/[id] - fetch a specific menu item
// PUT /api/menu/[id] - update a menu item (employee only)
// DELETE /api/menu/[id] - delete a menu item (employee only)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Implement database query
    // SELECT ItemID, ItemName, Description, Price, Category, IsAvailable, CreatedBy, CreatedAt
    // FROM MenuItems
    // WHERE ItemID = ?
    
    return Response.json({
      success: true,
      data: {
        ItemID: id,
        ItemName: null,
        Description: null,
        Price: null,
        Category: null,
        IsAvailable: 1,
        CreatedBy: null,
        CreatedAt: null,
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch menu item' },
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
    // 1. Verify current user is admin (IsAdmin = 1)
    // 2. UPDATE MenuItems 
    //    SET ItemName = ?, Description = ?, Price = ?, Category = ?, IsAvailable = ?
    //    WHERE ItemID = ?
    // 3. Return updated item
    
    const allowedFields = ['ItemName', 'Description', 'Price', 'Category', 'IsAvailable'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Menu item updated',
      data: {
        ItemID: id,
        ...updateData
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TODO: Implement with database deletion
    // 1. Verify current user is admin (IsAdmin = 1)
    // 2. DELETE FROM MenuItems WHERE ItemID = ?
    // 3. Or alternatively, set IsAvailable = 0 instead of hard delete
    
    return Response.json({
      success: true,
      message: `Menu item ${id} deleted`
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
