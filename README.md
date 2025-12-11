# ScrolliTelli Creaction Tool Overview

This is a ScrolliTelli webpage creation tool intended for educators and other interested parties to create their own ScrolliTelli presentation. User can upload a series of images, apply specific blur settings to create a point of focus, create corresponding text sections, and then export their presentation as an html file to share with others. This tool is intended to be used on a desktop application, and is not designed with mobile devices in mind.

## Usage
To begin using the ScrolliTelli creation tool, visit https://james-c-royer.github.io/ScrolliTelli/ where you will be sent to the home page. Here, you can upload your first image by using the "Click here to upload an image" button and then select how many sections you would like to create — both the image and number of sections can be changed later. The following image types are supported on most web browsers: JPG/JPEG, PNG, GIF, WebP. BMP, SVG, ICO. Other image files might work, but it depends on the web browser. Once you're ready to proceed, hit the "Finalize option selections" button to be sent to the next page.

On the next page, you have a number of ways to edit each section. Before you begin editing please keep in mind that the order these section appear on your presentation will be the same order as they appear in the editor. Along the top, you will see the "Add Section" and "Delete Section" buttons:
- "Add Section" will add an additional section at the end of the presentation
- "Delete Section" will completely delete the section selected. Both the image and the text content will disappear completely so make sure you don't want it!

Inside each section is an image and an area to insert text content. There are a couple ways to edit each image:
- Adjustable "Blur Strength" slider bar to make the image more/less blurry
- "Draw Circle" and "Draw Rectangle" buttons that allows you to click on the image and designate a portion to be exempt from the selected blur level
    -  Only one shape may be put on each image
- "Clear Shape" button to remove any shape you have drawn on the image previously
- "Replace Image" button will allow you to select a different image file
- "Remove Image" button will remove the image from the section, and create a text only section

Once each section has been customized as desired, there is an "Export as HTML" button at the bottom of the page. Clicking this will download a new HTML file to your device that can be opened to view your presentation in a web browser.

On the presentation page will be two sections: one for each image and one for their text content. The image will be on the left and the text content on the right. When scrolling down on the presentation, the image will stay in place while the text content will move upwards. Once you have scrolled far enough that the text content for the next section appears, the current image will be automatically replaced by the next.

## Features
#### Image Uploads
- Image upload: upload mutiple image to use in your presentation
- Image preview: See your uploaded image before proceeding to the editor
- Dynamic section creation: Choose how many sections to create from your base image when you start, with the ability add and delete sections if you change your mind later
- Replace image: Swap out any section's image with a different one
- Remove image: Convert any section to a text-only section by removing its image

#### Visual Editor
- Each images comes with a blur bar that may be used to apply blur
- Focus creation: Create a focus area by highlighting a region to be exempt from the blur
    - Circle tool: Creates a circular focus area
    - Rectangle tool: Creates a rectangular focus area
- Clear shape: removes the applied circle/rectangle applied to the image

#### Export Functionality
- HTML file export: once finished customizing, you can export your presentation as an HTML to share
- Custom title: name your presentation whatever you would like

#### ScrolliTelli File
- Edited images will display on the left side of the presentation, with text content on the right
- Slow scrolling speed ensures that users will have to read through text content
- Section image will transition once the text content for the new section appears


## Limitations
- Files that are above 2000KB in size will not function properly due to browser localstorage limits
