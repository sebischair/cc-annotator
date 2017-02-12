# cc-annotator package

The cc-annotator is a plugin for atom, which allows the user to annotate code.
Therefor two types of annotations exist. First create custom annotations for a
specific file. Second upload patterns which are used to annotate files automatically.

## Installation
Either just search the plugin via `Packages > Settings View > Install Packages/Themes`
or use the terminal `apm install cc-annotator`

## Usage

### Annotate code
To annotate a file open the specific file, right click and select
`Annotator > Annotate Code`. In case you did not annotated a file from this
opened project, you will be asked to select a server side project. \\
To not display the annotations anymore, right click in the specific file and select
`Annotator > Remove Annotation from Text Editor`.

### Create custom annotations
First select the specific tokens of the annotation, then right click and select
`Annotator > Create Custom Annotation`. In the now show pop-up window you can
add additional information to the annotation.

### Create detection patterns
To update the patterns used by the server to generate automized annotations
select `Packages > Annotator > Update Regular Expressions`.

### View Dashboard
View information about the currently opened file and its folder by selecting
select `Packages > Annotator > Open Dashboard`.
