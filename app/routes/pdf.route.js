
'use strict';

// Modules
var fs                             = require('fs-extra');
var _                              = require('underscore');
var get_filepath                   = require('../functions/get_filepath.js');
var remove_image_content_directory = require('../functions/remove_image_content_directory.js');
const { mdToPdf }                  = require('md-to-pdf');

const pageHandler     = require('../core/page');
const contentsHandler = require('../core/contents');


function route_pdf (config) {
  return async function (req, res, next) {

    // Filter out the image content directory and items with show_on_home == false
    var pageList = remove_image_content_directory(config,
      _.chain(await contentsHandler('/index', config))
        .filter(function (page) { return page.show_on_home; })
        .map(function (page) {
          page.files = _.filter(page.files, function (file) { return file.show_on_home; });
          return page;
        })
        .value());


    //get pdf file path
    var pdf_filepath = get_filepath({
      content  : [config.theme_dir, config.theme_name, 'public'].join('/'),
      filename : 'help-contentlink.pdf'
    });

    //generate pdf from pageList
    var currentContent = "";
    
    for(const category of pageList) {
      for(const file of category.files) {
        var filepath = config.content_dir +  file.slug + ".md";
        //console.log(filepath);
        const result = await pageHandler(
          filepath,
          config
        );

        //thats still not nice just generate something -> make it nice later
        currentContent += result.body;
      }
    } 

    await mdToPdf({ content: currentContent }, { dest: pdf_filepath });

    return res.sendFile(pdf_filepath);

  };
}

// Exports
module.exports = route_pdf;
