import config from './config';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '../../../components/Tag';
// import {readdir} from 'fs/promises';
// import path from 'path';

export default async function Gallery(){
  const demoInfos = config;
  return (<div className="container mx-auto px-5 py-10">
      <div className="flex flex-no-wrap">
        {demoInfos.map(demo => 
          (<div key={demo.name} className=' p-2 m-5 shadow'>
            <Link href={`/gallery/${demo.name}`} >
              <Image src={`/images/${demo.name}.png`} alt={demo.name} width={150} height={150}/>
            </Link>
            <div className='flex flex-nowrap'>
              {demo.tags.map((tag) => (<Tag key={tag} name={tag} type={""} className=' mx-1'/>))}
              {/* {demo.tags.map((tag) => (<Tag key={tag} color={"blue"}>{tag}</Tag>))} */}
            </div>
            </div>)
        )}
      </div>
    </div>)
 // </div>
}

// const demosDirectory = path.join(process.cwd(), "src/app/gallery");
// // const demosDirectory = path.join(__dirname); // cannot use __dirname
// async function getDemosData() {
  
//   // const files = await readdir(demosDirectory, {withFileTypes: true});
//   // console.log("........");
//   // console.log(demosDirectory);
//   // console.log(files);
//   // const folderNames = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
//   // const demoInfos: {name: string, tags: string[]}[] = [];
//   // for(const name of folderNames){
//   //   if(name.startsWith("." || name === "dist")) continue;
//   //   console.log("-", name);
//   //   demoInfos.push({
//   //     name,
//   //     tags: ""
//   //     // tags: await import(`${demosDirectory}/${name}/tags`) as string[]
//   //   });
//   // }
//   console.log("demoInfos", demoInfos);
//   return demoInfos;
// }