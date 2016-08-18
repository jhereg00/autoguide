# Autoguide

Node module to automatically build a styleguide/developer guide/whatever from comments in sass files.

By default, the template is built for an Atomic design workflow. [Mine](https://github.com/jhereg00/startup-library), specifically.

## Comment Format

Note the 3 \*'s to start the comment block, which tells Autoguide to include the comment.

```
/***
 * Item Title
 *
 * Item Description
 * this can be any number of lines until a variable
 * definition is found.
 *
 * Can also contain _markdown_.
 *
 * variable: value (see below for things the template
 *   listens for, but can be any key/value pair)
 *
 * @attribute name - description
 */
```
