import React, { useEffect, useState,useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import PopularPosts from '../../components/PopularPosts';
import BannerAd from '../../components/BannerAd';
import SidebarAd from '../../components/SidebarAd';
import InContentAd from '../../components/InContentAd';
import ResponsiveAd from '../../components/ResponsiveAd';
import TaskButton from '../../components/TaskButton';

const PostDetail = () => {
  const { postTitle } = useParams();
  const [post, setPost] = useState(null);
  const [postLike, setPostLike] = useState(null);
  const [bit, setBit] = useState(null);
  const targetButtonRef = useRef(null);
  const [topButtonClicked, setTopButtonClicked] = useState(false);
  const [postNo, setPostNo] = useState(null);
  const [passValue, setPassValue] = useState(null);
  const [nextLink, setNextLink] = useState(null);
  const [tnk, setTnk] = useState(null);
  



  const fetchPost = useCallback(async () => {
    try {
      const response1 = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts/${postTitle}`);
      setPost(response1.data);
      // Uncomment this line if you want to set the initial post likes
      // setPostLike(response1.data.likes); 
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }, [postTitle]); // Dependency on postTitle

  // Increment view count
  const incrementViewCount = useCallback(async () => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/viewsCount/${postTitle}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, [postTitle]); // Dependency on postTitle

  // Handle liking the post
  const handleLike = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/like-post/${postTitle}`);
      if (res.status === 200) {
        setPostLike(res.data.postLike); // Update the state with the new like count
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  // Get next post details
  const nextPostDet = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/posts`);
      response.data.forEach((post, index) => {
        if (post.title === postTitle) {
          setPostNo(index);
          if (response.data.length > index + 1) {
            const newBit = new URLSearchParams(window.location.search).get('bit');
            if (newBit&& tnk) {
              setNextLink(`/viewer/posts/${response.data[index + 1].title}?bit=${newBit}&tnk=${tnk}`);
            }
          } else {
            const newBit = new URLSearchParams(window.location.search).get('bit');
            if (newBit) {
              setNextLink(`/viewer/posts/${response.data[0].title}?bit=${bit}&tnk=${tnk}`);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching next post details:', error);
    }
  }, [postTitle,bit,tnk]); // Dependency on postTitle

  // Handle the effect for fetching post and related operations
  useEffect(() => {
    const newBit = new URLSearchParams(window.location.search).get('bit');
    const newTnk = new URLSearchParams(window.location.search).get('tnk');
    setBit(newBit)
    setTnk(newTnk);    
    fetchPost();
    incrementViewCount();
    nextPostDet();

    // Set passValue based on postNo
    if (postNo % 3 === 0) {
      setPassValue(1);
    } else if (postNo % 3 === 1) {
      setPassValue(2);
    } else if (postNo % 3 === 2) {
      setPassValue(4);
    }

  }, [postNo, fetchPost, incrementViewCount, nextPostDet]); // Include necessary dependencies

  if (!post) {
    return <div>Loading...</div>;
  }


  // Generate a description using the first 150 characters of the post content
  const description = post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';

  // Generate keywords based on the post title and some relevant terms
  const keywords = post.title.split(' ').join(', ') + ', blog, article';

  const handleTopButtonClick = (click) => {
    setTopButtonClicked(click);
  }


  return (
    <div className="container mx-auto p-4">
      <BannerAd/>
      <Helmet>
        <title>{`${post.title} - Tech Centry`}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Author Name" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: post.content.slice(0,200) }}
      />      
      {(bit&&tnk)?<TaskButton value={passValue} targetButtonRef={targetButtonRef} onTopButtonClick={handleTopButtonClick} count={10} nextLink={nextLink}/>:''}
      <InContentAd/>

      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: post.content.slice(200) }}
      />
      
      <div className="mt-4">
        <button className='rounded-sm'>Views: {post.views} </button>
        <button className='bg-blue-600 m-2 rounded-sm px-1' onClick={handleLike}>Likes: {postLike?postLike:post.likes} </button>
        <button className='bg-green-500 rounded-sm px-1'>Comments: {post.comments?post.comments.length:''}</button>
      </div>
      <aside ref={targetButtonRef} className="w-full lg:w-1/4 lg:pl-6">
          <SidebarAd />
        </aside>
        {(topButtonClicked && passValue!==1)?<TaskButton value={passValue+1} count={5} nextLink ={nextLink}/>:'' }
        <ResponsiveAd/>
      <PopularPosts/>
    </div>
  );
};

export default PostDetail;
