const fs = require('fs');

// Read the corrupted file
const filePath = './api3.js';
let content = fs.readFileSync(filePath, 'utf8');

// The clean approval route
const cleanApprovalRoute = `// Accept (approve) a pending credit by BPRND POC
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
    
    console.log(\`🔍 POC Approval Debug:\`, {
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
    console.log(\`✅ POC approval successful for pending credit \${id}\`);

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
});`;

// Find the start and end of the corrupted route
const startMarker = "app.post('/api/bprnd/pending-credits/:id/accept', async (req, res) => {";
const endMarker = "});";

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find start of approval route');
  process.exit(1);
}

// Find the end of the route (look for the closing }); after the start)
let braceCount = 0;
let endIndex = -1;
let inRoute = false;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    if (!inRoute) inRoute = true;
    braceCount++;
  } else if (content[i] === '}') {
    braceCount--;
    if (inRoute && braceCount === 0) {
      // Look for the closing parenthesis and semicolon
      if (i + 2 < content.length && content[i + 1] === ')' && content[i + 2] === ';') {
        endIndex = i + 2;
        break;
      }
    }
  }
}

if (endIndex === -1) {
  console.error('Could not find end of approval route');
  process.exit(1);
}

console.log(`Found route from index ${startIndex} to ${endIndex}`);

// Replace the corrupted route
const beforeRoute = content.substring(0, startIndex);
const afterRoute = content.substring(endIndex + 1);

const newContent = beforeRoute + cleanApprovalRoute + '\n\n' + afterRoute;

// Write the fixed file
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Successfully fixed api3.js file');
