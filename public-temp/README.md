# JS239 Take Home Project

## Assumptions

- In the example project, when you attempt to enter a todo title less than 3 characters, you are  
  alerted and the modal remains open. This behavior is not mentioned in the explicit requirements,  
  but I matched it in my application.

- This is not mentioned in the explicit requirements, but is observed behavior of the example  
  app: when the currently selected list is a date group and there is only one item remaining,  
  if the user takes an action such that that dated list would now be empty by either  
   **a)** deleting that item or **b)** toggling the item to a completion state that takes it out of that  
   category, the nav bar updates accordingly, and the number next to the title updates  
   accordingly (it will say `0`), the title itself does not change; it will remain  
   as the old date or "No Due Date". If you navigate away, you cannot get back to it, so the  
   title not changing immediately is the only blemish. I replicated this behavior in my application.

- Lastly, with regard to updating an existing todo item, all fields save as expected with one scenario excepted:

  - If a todo has a field that currently contains a non-empty value, and the user attempts to  
    modify the todo such that said field should be updated to empty, the update does not persist.
    - This does not apply to the title since it cannot ever be empty. It only applies to the  
      description and the date.
  - This behavior is due to this function in the server-side code (`/routes/api.js`):

  ```javascript
  function createUpdateQuery(todoObj, id) {
    const attributesForUpdate = Object.keys(todoObj).filter(function (key) {
      return todoObj[key] !== "" && key !== "completed";
    });

    const attributesForUpdateQuery = attributesForUpdate.map(function (key) {
      return `${key} = "${todoObj[key]}"`;
    });

    return `UPDATE TODOS SET ${attributesForUpdateQuery.join(
      ", "
    )} WHERE id = ${id};`;
  }
  ```

When assigning the variable `attributesForUpdate`, the code filters out empty values, so attempting  
to update/revert a field back to empty (removing a due date, removing a description) does not  
actually get passed on to the database.

- I mention this because the behavior is different in the example app. I examined the javascript  
  in the example app to see how updating worked inside of it compared to how the server  
  implemented updates.

  - In the example app javascript, todos are simply saved in localStorage, and it does not filter  
    out empty values. The values entered in the form are exactly what get saved to storage, so  
    reverting to an empty description is possible.
    Reverting to an empty date is also possible  
     because the `formatDate` function checks for the values "Month", "Day", and "Year" (the  
     default values in the modal form).
  - In contrast, within the node version of the app, if those default values are passed to the  
    server, the request will not be able to complete because of this code:

  ```javascript
  function isValidTodo(todo) {
    return (
      todo.title.length >= 3 &&
      (todo.day.length === 2 || todo.day === "") &&
      (todo.month.length === 2 || todo.month === "") &&
      (todo.year.length === 4 || todo.year === "")
    );
  }
  ```

  The default strings of "Month", "Year", and "Day" would not pass this check, and the todo  
   would be rejected as invalid. I attempted to pass in "Mo", "Da", and "Year" instead so that the  
   values would pass as a valid todo, but that disrupted the "No Due Date" check, and  
   it still did not fix the original issue of not being able to revert to empty values, so I stuck with the  
   approach of turning the default strings into empty strings before they are passed to the server (`_sanitizeDate` in `todos.js`).

- All of this being said, I decided to leave the behavior as is and include it as a "known anomaly" in this document.
