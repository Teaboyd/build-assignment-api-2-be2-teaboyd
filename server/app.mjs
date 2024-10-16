import express from "express";
import connectionPool from "./utils/db.mjs";


const app = express();
const port = 4001;

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async(req,res) => {
  //logic ในการอ่านข้อมูลโพสต์ทั้งหมดในระบบ
  //1) เขียน query เพื่ออ่านข้อมูลโพสต์ด้วย connection pool
  let results;

  try{
    results = await connectionPool.query(`select * from users`);
  }catch(error){
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }

  //2) Return ตัว response กลับไปหา client
  return res.status(200).json({
    data:results.rows,
  });
});

app.get("/assignments/:assignmentId",async(req,res)=>{
  try{
    const AssignmentIdFromClient = req.params.assignmentId
    const results = await connectionPool.query(`select * from assignments where assignment_id=$1`,[AssignmentIdFromClient]);

    if (!results.rows[0]){
        return res.status(404).json({
        message: "Server could not find a requested assignment"
      });
    }

    return res.status(200).json({
      data: results.rows[0],
    });
  }catch(error){
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }
});

app.put("/assignments/:assignmentId",async(req,res)=>{
  try{
  const AssignmentIdFromClient = req.params.assignmentId;
  const updatedAssignment = {...req.body,updated_at:new Date()};
  const reso = await connectionPool.query(
    `
    update assignments
    set title = $2,
        content = $3,
        category = $4,
        updated_at = $5
    where assignment_id = $1
    `,
    [
      AssignmentIdFromClient,
      updatedAssignment.title,
      updatedAssignment.content,
      updatedAssignment.category,
      updatedAssignment.updated_at,
    ]
  );

  if(!reso.rows[0]){
    return res.status(404).json({
      message: "Server could not find a requested assignment to update",
    });
  }

  return res.status(200).json({
    message: "Updated post successfully",
  });
  }catch(error){
      return res.status(500).json({
        message: "Server could not update assignment because database connection",
      });
  }
});

app.delete("/assignments/:assignmentId",async(req,res)=>{
  try
  {
  const AssignmentIdFromClient = req.params.assignmentId;
  const result = await connectionPool.query(
    `delete from assignments
    where assignment_id = $1`,[AssignmentIdFromClient]
  );

  if(!result.rows[0]){
    return res.status(404).json({
      message: "Server could not find a requested assignment to delete",
    })
  }

  return res.status(200).json({
    message: "Deleted assignment sucessfully",
  });
  }catch(error){
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
