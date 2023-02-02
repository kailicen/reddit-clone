import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/src/firebase/clientApp";
import { GetServerSidePropsContext } from "next";
import React, { ReactElement, useEffect } from "react";
import { Community, communityState } from "@/src/atoms/communitiesAtom";
import safeJsonStringify from "safe-json-stringify";
import NotFound from "@/src/components/Community/NotFound";
import Header from "@/src/components/Community/Header";
import PageContent from "@/src/components/Layout/PageContent";
import CreatePostLink from "@/src/components/Community/CreatePostLink";
import Posts from "@/src/components/Posts/Posts";
import { useRecoilState } from "recoil";
import About from "@/src/components/Community/About";

interface CommunityPageProps {
  communityData: Community;
}

export default function CommunityPage({
  communityData,
}: CommunityPageProps): ReactElement {
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);

  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: communityData,
    }));
  }, [communityData]);

  if (!communityData) {
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get community data and pass it to client
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);

    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
            )
          : "",
      },
    };
  } catch (error) {
    // could add error page here
    console.log("getServerSideProps error", error);
  }
}
