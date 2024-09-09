import Header from '@/components/pagesComponent/Header';
import TransformationForm from '@/components/pagesComponent/Transform';
import { transformationTypes } from '@/constant';
import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  console.log("skilo")
  const { userId } = auth();
  const transformation = transformationTypes[type];

  if(!userId) redirect('/sign-in')
    console.log(userId,"addimage")
  const user = await getUserById(userId);
  

  return (
    <>
      <Header 
        title={transformation.title}
        subtitle={transformation.subTitle}
      />
    
      <section className="mt-10">
        <TransformationForm 
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          // creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage