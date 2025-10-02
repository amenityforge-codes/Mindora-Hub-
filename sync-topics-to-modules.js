const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
const Topic = require('./models/Topic');
const Module = require('./models/Module');
const Video = require('./models/Video');
const Quiz = require('./models/Quiz');

// Connect to MongoDB
mongoose.connect('mongodb+srv://eienglish:eienglish123@cluster0.8qjqj.mongodb.net/eienglish?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get all lessons with their topics
      const lessons = await Lesson.find({})
        .populate('topics')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${lessons.length} lessons`);
      
      for (const lesson of lessons) {
        console.log(`\nProcessing lesson: ${lesson.title}`);
        
        // Find or create corresponding module
        let module = await Module.findOne({ title: lesson.title });
        if (!module) {
          console.log(`Creating module for lesson: ${lesson.title}`);
          module = new Module({
            title: lesson.title,
            description: lesson.description,
            moduleType: 'phonics', // Default type
            ageRange: lesson.ageRange === '6-15' ? '6-15' : '16+',
            difficulty: lesson.difficulty?.toLowerCase() || 'beginner',
            estimatedDuration: lesson.estimatedDuration || 30,
            createdBy: new mongoose.Types.ObjectId(), // Default admin user
            status: 'published'
          });
          await module.save();
          console.log(`Created module: ${module._id}`);
        } else {
          console.log(`Found existing module: ${module._id}`);
        }
        
        // Process topics for this lesson
        if (lesson.topics && lesson.topics.length > 0) {
          console.log(`Processing ${lesson.topics.length} topics`);
          
          for (const topic of lesson.topics) {
            console.log(`  - Topic: ${topic.title}`);
            
            // Update videos to use the correct moduleId
            const videos = await Video.find({ moduleId: lesson._id });
            if (videos.length > 0) {
              console.log(`    Updating ${videos.length} videos to use module ID`);
              await Video.updateMany(
                { moduleId: lesson._id },
                { moduleId: module._id }
              );
            }
            
            // Update quizzes to use the correct moduleId
            const quizzes = await Quiz.find({ moduleId: lesson._id });
            if (quizzes.length > 0) {
              console.log(`    Updating ${quizzes.length} quizzes to use module ID`);
              await Quiz.updateMany(
                { moduleId: lesson._id },
                { moduleId: module._id }
              );
            }
          }
        }
      }
      
      console.log('\n✅ Sync completed successfully!');
      
      // Show summary
      const totalModules = await Module.countDocuments();
      const totalVideos = await Video.countDocuments();
      const totalQuizzes = await Quiz.countDocuments();
      
      console.log(`\n📊 Summary:`);
      console.log(`- Modules: ${totalModules}`);
      console.log(`- Videos: ${totalVideos}`);
      console.log(`- Quizzes: ${totalQuizzes}`);
      
    } catch (error) {
      console.error('Error syncing topics:', error);
    } finally {
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

