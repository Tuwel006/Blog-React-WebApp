import React, { useEffect, useState,useRef } from 'react';
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
  const [id, setId] = useState(null);
  const targetButtonRef = useRef(null);
  const [topButtonClicked, setTopButtonClicked] = useState(false);
  const [postNo, setPostNo] = useState(null);
  const [passValue, setPassValue] = useState(null);
  const [nextLink, setNextLink] = useState(null);
  

  // useEffect(() => {
  //   fetchPost();
  //   incrementViewCount();
  //   nextPostDet();
  //   const newId = new URLSearchParams(window.location.search).get('id');
  //   setId(newId);
    
  // }, []);



  const fetchPost = async () => {
    try {
      const response1 = await axios.get(`http://localhost:5000/posts/${postTitle}`);

      setPost(response1.data);
      //setPostLike(post.likes);

    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await axios.post(`http://localhost:5000/viewsCount/${postTitle}`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/like-post/${postTitle}`);
      if (res.status === 200) {
        setPostLike(res.data.postLike); // Update the state with the new like count
      }
    } catch (error) {
      console.log('Error liking the post:', error);
    }
  };

  const nextPostDet = async () => {
    const response = await axios.get(`http://localhost:5000/posts`);
    // console.log(response.data);
    response.data.map((post,index) => {
      if(post.title === postTitle) {
        setPostNo(index);
        if(response.data.length>index+1){
          const newId = new URLSearchParams(window.location.search).get('id');
          if(id){
            setNextLink(`/viewer/posts/${response.data[index+1].title}?id=${id}`);
          }
        }
        else{
          setNextLink(`/viewer/posts/${response.data[0].title}?id=${id}`);
        }
      }
return 0;
    })
    
    //setNextPost(response.data[postNo+1]);
    
  }


    

 // console.log("Post no: "+postNo);

  useEffect(() => {
    if (postNo % 3 === 0) {
      setPassValue(1);
    } else if (postNo % 3 === 1) {
      setPassValue(2);
    } else if (postNo % 3 === 2) {
      setPassValue(4);
    }
    nextPostDet();
    fetchPost();
    incrementViewCount();
    const newId = new URLSearchParams(window.location.search).get('id');
    setId(newId);
  }, [postNo]);

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
      {id?<TaskButton value={passValue} targetButtonRef={targetButtonRef} onTopButtonClick={handleTopButtonClick} count={10} nextLink={nextLink}/>:''}
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
