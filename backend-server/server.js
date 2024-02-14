require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

const Student = require("./models/Student");

//connect to cloud database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("Connected to Database"));

const StudentType = new GraphQLObjectType({
  name: "Student",
  description: "This represents a student",
  fields: () => ({
    _id: { type: GraphQLNonNull(GraphQLString) },
    userName: { type: GraphQLNonNull(GraphQLString) },
    firstName: { type: GraphQLNonNull(GraphQLString) },
    lastName: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    student: {
      type: StudentType,
      description: "A single Student",
      args: {
        _id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        let student = await Student.findById(args._id);
        return student;
      },
    },
    students: {
      type: new GraphQLList(StudentType),
      description: "A list of students",
      resolve: async (parent, args) => {
        const students = await Student.find();
        return students;
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: "Root Mutation",
  fields: () => ({
    addStudent: {
      type: StudentType,
      description: "Add a new student",
      args: {
        userName: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const student = new Student({
          userName: args.userName,
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
        });
        const newStudent = await student.save();
        return newStudent;
      },
    },
    updateStudent: {
      type: StudentType,
      description: "Update an existing student",
      args: {
        _id: { type: GraphQLNonNull(GraphQLString) },
        userName: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const updatedStudent = await Student.findByIdAndUpdate(
          args._id,
          {
            userName: args.userName,
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
          },
          { new: true }
        );
        return updatedStudent;
      },
    },
    deleteStudent: {
      type: StudentType,
      description: "Delete a student",
      args: {
        _id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const deletedStudent = await Student.findByIdAndDelete(args._id);
        return deletedStudent;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

//middleware
app.use(express.json());
app.use(cors());
app.use(
  "/students",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

app.listen(3000, () => console.log("Server Started"));
