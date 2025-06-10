const { LearnerVideo } = require('../models/index.js');
const { successResponse, errorResponse } = require('../utils/responseHandler.js');

// Create Video
exports.createVideo = async (req, res) => {
  try {
    const { name, duration } = req.body;
    const videoUrl = req.file?.path;

    if (!name || !duration || !videoUrl) {
      return errorResponse(res, 400, 'Name, duration, and video file are required.');
    }

    const video = await LearnerVideo.create({ name, duration, videoUrl });

    return successResponse(res, 201, 'Video uploaded successfully', video);
  } catch (error) {
    console.error('Create video error:', error);
    return errorResponse(res, 500, 'Error creating video');
  }
};

// Get All Videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await LearnerVideo.findAll();
    return successResponse(res, 200, 'Videos retrieved successfully', videos);
  } catch (error) {
    console.error('Fetch videos error:', error);
    return errorResponse(res, 500, 'Error fetching videos');
  }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const learnerVideo = await LearnerVideo.findByPk(id);

    if (!learnerVideo) {
      return res.status(404).json({ success: false, message: 'Learner video not found' });
    }

    res.status(200).json({ success: true, data: learnerVideo });
  } catch (error) {
    console.error('Error fetching learner video:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch learner video details.' });
  }
};

// Update Video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration } = req.body;
    const videoUrl = req.file?.path;

    const video = await LearnerVideo.findByPk(id);

    if (!video) {
      return errorResponse(res, 404, 'Video not found');
    }

    const updateData = { name, duration };
    if (videoUrl) updateData.videoUrl = videoUrl;

    await video.update(updateData);

    return successResponse(res, 200, 'Video updated successfully', video);
  } catch (error) {
    console.error('Update video error:', error);
    return errorResponse(res, 500, 'Error updating video');
  }
};

// Delete Video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await LearnerVideo.findByPk(id);

    if (!video) {
      return errorResponse(res, 404, 'Video not found');
    }

    await video.destroy();

    return successResponse(res, 200, 'Video deleted successfully');
  } catch (error) {
    console.error('Delete video error:', error);
    return errorResponse(res, 500, 'Error deleting video');
  }
};
