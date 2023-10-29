import { Fragment, type FC } from 'hono/jsx'
import type { Todo } from './schema'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { todo } from './schema'
import { db } from './db'
import { desc, eq } from 'drizzle-orm'

const app = new Hono()

const HTML: FC = (props) => {
  return (
    <html>
      <head>
        <title> TODO MVC with Hono </title>
        {
          /*
           */
        }
        <script src="https://unpkg.com/htmx.org@latest"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>


      </head>
      <body>
        {props.children}
      </body>
    </html>
  )
}

const Block: FC = (props: { title: string, description: string, id: number }) => {
  return (
    <div>
      <h2> {props.title} </h2>
      <p> {props.description} </p>
      <button hx-get={`/edit/${props.id}`} hx-target="closest div" hx-swap="outerHTML"> Edit </button>
      <button hx-delete={`/edit/${props.id}`} hx-target="closest div" hx-swap="outerHTML"> Delete </button>
    </div>
  )
}

const EditableBlock: FC = (props: { title: string, description: string, id: number }) => {
  return (
    <form hx-post={`/edit/${props.id}`}>
      <label for="title"> Title </label>
      <input name="title" type="text" id="title" value={props.title} />
      <br />
      <label for="description"> Description </label>
      <textarea name="description" id="description">
        {props.description}
      </textarea>
      <button type='submit'> Save </button>
      <button hx-delete={`/edit/${props.id}`} hx-target="closest div" hx-swap="outerHTML"> Delete </button>
    </form>
  )
}

const Adder: FC = () => (
  <form hx-post="/save" hx-target="#todo-target" hx-swap="afterend">
    <label for="title"> Title </label>
    <input type="text" name="title" id="title" />
    <br />
    <label for="description"> Description </label>
    <input type="text" name="description" id="description" />
    <br />
    <input type="submit" />
  </form>
)

app.post('/save',
  validator('form', (value, c) => {
    const title = value['title']
    const description = value['description']
    if (typeof title === 'string' && typeof description === 'string') {
      return { title: title, description: description }
    }
    return c.text('Invalid Response', 400)
  }),
  async (c) => {
    const { title, description } = c.req.valid('form')

    try {
      const res = await db
        .insert(todo)
        .values({
          title: title,
          description: description
        }).returning()
      return c.html(<Block title={res[0].title} description={res[0].description} id={res[0].id}></Block>)
    } catch {
      return c.text('Failed to Create', 400)
    }
  }
)

app.get('/todos',
  async (c) => {
    const result = await db
      .select()
      .from(todo)

    return c.html(
      <Fragment>
        {
          result.map(v => <Block
            title={v.title}
            description={v.description}
            id={v.id}
          />)
        }
      </Fragment>
    )
  }
)

app.get('/', (c) => c.html(
  <HTML>
    <h1 hx-get="/todos" hx-target="#todo-target" hx-trigger="load"> HTML with proops </h1>
    <Adder />
    <div id="todo-target"></div>
  </HTML>
))

app.get('/edit/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const res = await db.select().from(todo).where(eq(todo.id, id)).limit(1)
    return c.html(
      <EditableBlock title={res[0].title} description={res[0].description} id={id} />
    )
  } catch (e) {
    if (e instanceof Error) console.log(e.message)
    return c.text('Not Found.', 500)
  }
})

app.post('/edit/:id',
  validator('form', (value, c) => {
    const title = value['title']
    const description = value['description']
    if (typeof title === 'string' && typeof description === 'string') {
      return { title: title, description: description }
    }
    return c.text('Invalid Response', 400)
  }),
  async (c) => {
    try {
      const id = parseInt(c.req.param('id'))
      const { title, description } = c.req.valid('form')
      const res = await db.update(todo).set({ title: title, description: description }).where(eq(todo.id, id)).returning()
      return c.html(
        <Block title={res[0].title} description={res[0].description} id={id} />
      )
    } catch (e) {
      if (e instanceof Error) console.log(e.message)
      return c.text('Not Found.', 500)
    }
  })

app.delete('/edit/:id', async (c) => {
    const id = parseInt(c.req.param('id'))
    await db.delete(todo).where(eq(todo.id, id))
    return c.html("")
  }
)

serve(app)
