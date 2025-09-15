// Accept (approve) a pending credit by BPRND POC
app.post('/api/bprnd/pending-credits/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pending credit ID format'
      });
    }

    // Find and update the pending credit
    const pendingCredit = await PendingCredits.findByIdAndUpdate(
      id,
      { 
        bprnd_poc_approved: true,
        status: 'poc_approved'
      },
      { new: true }
    );
    
    console.log(`🔍 POC Approval Debug:`, {
      pendingCreditId: id,
      adminApproved: pendingCredit.admin_approved,
      pocApproved: pendingCredit.bprnd_poc_approved,
      status: pendingCredit.status,
      discipline: pendingCredit.discipline,
      totalHours: pendingCredit.totalHours
    });

    if (!pendingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Pending credit request not found'
      });
    }

    // POC approval successful - waiting for admin approval
    console.log(`✅ POC approval successful for pending credit ${id}`);

    res.json({
      success: true,
      message: 'BPRND POC approval successful. Waiting for admin approval.',
      data: {
        id: pendingCredit._id,
        admin_approved: pendingCredit.admin_approved,
        bprnd_poc_approved: pendingCredit.bprnd_poc_approved,
        status: 'poc_approved'
      }
    });

  } catch (error) {
    console.error('Error accepting pending credit:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting pending credit: ' + error.message
    });
  }
});
