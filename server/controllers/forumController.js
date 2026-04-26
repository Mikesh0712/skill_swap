import ForumPost from '../models/ForumPost.js';
import Comment from '../models/Comment.js';

// GET all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('authorId', 'username name')
      .populate({ path: 'comments', populate: { path: 'authorId', select: 'username name' } })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
};

// POST a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    const newPost = new ForumPost({
      authorId: req.user._id,
      title,
      content,
      category,
      likes: [],
      comments: []
    });

    const savedPost = await newPost.save();
    const populatedPost = await ForumPost.findById(savedPost._id)
      .populate('authorId', 'username name')
      .populate({ path: 'comments', populate: { path: 'authorId', select: 'username name' } });
    res.status(201).json(populatedPost);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// DELETE a post
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the current user is the author
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

// PUT toggle like on a post
export const toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    const updatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'username name')
      .populate({ path: 'comments', populate: { path: 'authorId', select: 'username name' } });
    res.status(200).json(updatedPost);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

// POST add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await ForumPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      postId: id,
      authorId: req.user._id,
      content
    });

    const savedComment = await newComment.save();
    post.comments.push(savedComment._id);
    await post.save();

    const updatedPost = await ForumPost.findById(id)
      .populate('authorId', 'username name')
      .populate({ path: 'comments', populate: { path: 'authorId', select: 'username name' } });

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};
