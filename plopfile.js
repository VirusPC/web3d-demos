const frameworks = ['D3', 'Vega', 'Vega-Lite', 'AntV', 'Echarts', 'RoughViz'];

const InsertPoints = {};
frameworks.forEach(framework => {
    InsertPoints[framework] = `<!-- ${framework} Insert Point -->`
});

module.exports = function (plop) {
    plop.setGenerator('new', {
        description: 'Add new demo',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'Demo name please'
        }, {
            type: 'input',
            name: 'tags',
            message: 'Tags please',
        }],
        actions: (answers) => {
          const {name, tags} = answers;
          let tagsArr = JSON.parse(tags);
          if(!Array.isArray(tagsArr)) tagsArr = [];
          else tagsArr = tagsArr.map(item => "" + item)
          return [{
            type: 'add',
            path: 'src/app/gallery/(demos)/{{kebabCase name}}/page.tsx',
            templateFile: 'templates/page.hbs'
        },{
            type: 'add',
            path: 'src/app/gallery/(demos)/{{kebabCase name}}/render.ts',
            templateFile: 'templates/render.hbs'
        },{
            type: 'modify',
            path: 'src/app/gallery/config.ts',
            pattern: `// __plop_insert_point__`,
            template: `, {
  name: "${name}",
  width: "w-40",
  tags: ${JSON.stringify(tagsArr)}
}// __plop_insert_point__`
        }]
      }
    })
}