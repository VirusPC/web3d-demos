import config from './config';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '../../../components/Tag';
import classNames from 'classnames';
import { capitalCase } from 'change-case';
// import {readdir} from 'fs/promises';
// import path from 'path';

export default async function Gallery(){
  const demoInfos = config;
  return (<div className="container mx-auto px-5 py-10 flex flex-wrap shrink-0">
      {/* <div className="columns-2 gap-2 md:columns-4 md:gap-4 lg:columns-5 lg:gap-5"> */}
      {/* <div className=""> */}
        {demoInfos.map(demo => 
          (<div key={demo.name} className={classNames(' h-56 p-2 m-5 shadow rounded flex flex-nowrap flex-col', demo.width)}>
              <div className='relative w-full h-full'>
                <Link href={`/gallery/${demo.name}`} >
                    <Image src={`/images/${demo.name}.png`} alt={demo.name} fill={true}/>
                </Link>
              </div>
              <div className='flex flex-wrap justify-center align-middle h-auto min-h-9 w-scroll'>
                {demo.tags.map((tag) => (<Tag key={tag} name={tag} type={""} className='mx-1 my-0.5'/>))}
              </div>
              <div className=' text-center text-lg font-bold'>{capitalCase(demo.name)}</div>
            </div>)
        )}
      {/* </div> */}
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