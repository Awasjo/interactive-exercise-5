import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

// Define your GraphQL queries and mutations
const ADD_STUDENT = gql`
  mutation AddStudent(
    $userName: String!
    $firstName: String!
    $lastName: String!
    $email: String!
  ) {
    addStudent(
      userName: $userName
      firstName: $firstName
      lastName: $lastName
      email: $email
    ) {
      _id
      userName
      firstName
      lastName
      email
    }
  }
`;

const FIND_STUDENTS = gql`
  query FindAllStudents {
    students {
      _id
      userName
      firstName
      lastName
      email
    }
  }
`;

const UPDATE_STUDENT = gql`
  mutation UpdateStudent($_id: String!, $userName: String!) {
    updateStudent(_id: $_id, userName: $userName) {
      _id
      userName
      firstName
      lastName
      email
    }
  }
`;

const DELETE_STUDENT = gql`
  mutation DeleteStudent($_id: String!) {
    deleteStudent(_id: $_id) {
      _id
      userName
      firstName
      lastName
      email
    }
  }
`;

const Students = () => {
  const [formData, setFormData] = useState({
    _id: "", 
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  // Use the useQuery hook to fetch the list of students
  const { loading, error, data, refetch } = useQuery(FIND_STUDENTS);

  // Use the useMutation hook to handle mutations
  const [addStudent] = useMutation(ADD_STUDENT, {
    onCompleted: () => {
      // Refetch the student list after creating a new student
      refetch();
    },
  });

  const [updateStudent] = useMutation(UPDATE_STUDENT, {
    onCompleted: () => {
      // Refetch the student list after updating a student
      refetch();
    },
  });

  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    onCompleted: () => {
      // Refetch the student list after deleting a student
      refetch();
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.userName && formData.firstName && formData.lastName && formData.email) {
      if (formData._id) {
        // If _id is present, it's an update operation
        updateStudent({
          variables: {
            _id: formData._id,
            userName: formData.userName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          },
        });
      } else {
        // If _id is not present, it's an add operation
        addStudent({
          variables: {
            userName: formData.userName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          },
        });
      }

      // Clear the form data after submission
      setFormData({
        _id: "",
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
      });
    }
  };

  const handleEdit = (student) => {
    // Set form data for editing
    setFormData({
      _id: student._id,
      userName: student.userName,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    });
  };

  const handleDelete = (student) => {
    // Delete the selected student
    deleteStudent({
      variables: {
        _id: student._id,
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Students</h1>
      <div>
        {/* Form for creating or updating students */}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
            />
          </label>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
        {/* List of students */}
        {data.students.map((student) => (
          <div key={student._id}>
            <p>{`Name: ${student.firstName} ${student.lastName}`}</p>
            <p>{`Username: ${student.userName}`}</p>
            <p>{`Email: ${student.email}`}</p>
            <button onClick={() => handleEdit(student)}>Edit</button>
            <button onClick={() => handleDelete(student)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Students;
