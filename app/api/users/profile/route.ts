// API Route for user profile management
// GET /api/users/profile - fetch current user's profile (from Users and Profiles tables)
// PUT /api/users/profile - update current user's profile

export async function GET(request: Request) {
  try {
    // TODO: Get current UserID from session/JWT token
    // const UserID = getCurrentUserId();
    // if (!UserID) {
    //   return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }
    
    // TODO: Query both tables
    // SELECT u.UserID, u.Email, u.IsAdmin, u.CreatedAt,
    //        p.ProfileID, p.Name, p.Address, p.CellPhone
    // FROM Users u
    // LEFT JOIN Profiles p ON u.UserID = p.UserID
    // WHERE u.UserID = ?
    
    return Response.json({
      success: true,
      data: {
        user: {
          UserID: null,
          Email: null,
          IsAdmin: 0,
          CreatedAt: null,
        },
        profile: {
          ProfileID: null,
          UserID: null,
          Name: null,
          Address: null,
          CellPhone: null,
        }
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Update user profile
    // 1. Get current UserID from session/JWT
    // 2. If updating profile info (Name, Address, CellPhone):
    //    - CHECK if Profiles record exists for this UserID
    //    - If exists: UPDATE Profiles SET Name = ?, Address = ?, CellPhone = ? WHERE UserID = ?
    //    - If not exists: INSERT INTO Profiles (UserID, Name, Address, CellPhone) VALUES (?, ?, ?, ?)
    // 3. Return updated profile
    
    const allowedFields = ['Name', 'Address', 'CellPhone'];
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
    
    // TODO: Verify current user is authenticated
    // const UserID = getCurrentUserId();
    // if (!UserID) {
    //   return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }
    
    return Response.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        UserID: null, // Will be set from current user
        ...updateData,
        UpdatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
