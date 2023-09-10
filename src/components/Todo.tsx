import { FormEvent, useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLQuery } from '@aws-amplify/api';
import { CreateTodoInput, CreateTodoMutation, DeleteTodoMutation, ListTodosQuery, Todo, UpdateTodoInput, UpdateTodoMutation } from '../API';
import { listTodos } from '../graphql/queries';
import { createTodo, deleteTodo, updateTodo } from '../graphql/mutations';
import { WithAuthenticatorProps, withAuthenticator } from '@aws-amplify/ui-react';



function Todo({signOut, user}: WithAuthenticatorProps) {
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [todo, setTodo] = useState<Todo | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('');


  useEffect(() => {
    (async function (){
     const res = await API.graphql<GraphQLQuery<ListTodosQuery>>(graphqlOperation(listTodos));
      
     if(!res) {
      return
     }
     
    if(res.data?.listTodos?.items) {
      setTodos(res.data?.listTodos?.items as Todo[]);
    }
     
    })()
  }, [success])

  async function createTodoItem (e: FormEvent) {
    e.preventDefault();
    if(!input) {
      return setError('Please don\'t leave the input empty.' )
    }
    
    const todo : CreateTodoInput = {
      name : input,
      description : desc
    };
    
    setSuccess(false);
    const res = await API.graphql<GraphQLQuery<CreateTodoMutation>>(graphqlOperation(createTodo, { input: todo }));
    
    if(!res) {
      return;
    }

    if((res.data?.createTodo)) {
      // const newTodo = res.data?.createTodo;
      setInput('');
      setDesc('');
      setSuccess(true);
    }

  }

  async function deleteTodoItem(id : string) {
    setSuccess(false);
    const res = await API.graphql<GraphQLQuery<DeleteTodoMutation>>(graphqlOperation(deleteTodo, {input: {id}}));
    
    if(res.data?.deleteTodo) {
      setSuccess(true);
    }
  }

  async function editTodoItem(e : FormEvent) {
    try {
      e.preventDefault();
      if(!input) {
        return setError('Please don\'t leave the input empty.' )
      }
      
      setSuccess(false);
      const newTodo : UpdateTodoInput = {
        id: todo?.id as string,
        name: input,
        description: desc
      }
      console.log(newTodo);
      const res = await API.graphql<GraphQLQuery<UpdateTodoMutation>>(graphqlOperation(updateTodo, {input: newTodo}));
      
      if(res.data?.updateTodo) {
        setSuccess(true);
        setInput('');
        setDesc('');
        setTodo(null);
      }
    } catch (error) {
      console.log(error);
    }
    
  }

  function startEdit (todo: Todo) {
    setInput(todo.name);
    setDesc(todo.description as string);
    setTodo(todo);
  }

  return (
    <>
      <h1>Todo Application</h1>
      <div className='header'>
        <h2>Hello, {user?.username}</h2>
        <button onClick={signOut}>Sign out</button>
        </div>
      <div className='container'>
        <div className='container--left'>
          <h2>Add Task</h2>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            {error && <span className='error'>{error}</span>}
            <input placeholder='Enter Task' className="input" value={input} onChange={(e) => {setError(''); setInput(e.target.value)}} />
            <textarea placeholder='Enter Task description' className="input" value={desc} onChange={(e) => {setError(''); setDesc(e.target.value)}} /><br />
            {!todo ? <button type="button" onClick={createTodoItem}>Add Todo</button> : <button type="button" onClick={editTodoItem}>Edit Todo</button>}
          </form>
        </div>
        <div className='container--right '>
          <h2>Todo lists</h2>
          <div className='todo-list'>
            {todos ? todos.map(todo => <div className='todo-item' key={todo.id} >
              <div>
                <button className='btn btn--del' onClick={() => deleteTodoItem(todo.id)}>Del</button>
                <button className='btn btn-edit' onClick={() => startEdit(todo)}>Edit</button>
              </div>
              <div>
                <h3>{todo.name}</h3>
                <p>{todo.description}</p>
              </div>
            </div>) : null}
          </div>
        </div>
    </div>
    </>
  )
}

export default withAuthenticator(Todo);
