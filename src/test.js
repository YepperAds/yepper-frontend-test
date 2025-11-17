// ============================================
// 1. NEW STARTING POINT: WebsiteSelection.js
// ============================================
function WebsiteSelection() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/createWebsite');
        const data = await response.json();
        setWebsites(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch websites:', error);
        setLoading(false);
      }
    };
    fetchWebsites();
  }, []);

  const handleNext = () => {
    if (selectedWebsites.length === 0) return;

    // Navigate to category selection
    navigate('/select-categories', {
      state: { selectedWebsites }
    });
  };

  return (
    <div>
      {/* Website selection UI */}
      <button onClick={handleNext} disabled={selectedWebsites.length === 0}>
        Next: Select Categories
      </button>
    </div>
  );
}

// ============================================
// 2. Categories.js (MODIFIED)
// ============================================
const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWebsites } = location.state || {};

  const [categoriesByWebsite, setCategoriesByWebsite] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

  useEffect(() => {
    if (!selectedWebsites || selectedWebsites.length === 0) {
      navigate('/select-websites');
      return;
    }

    const fetchCategories = async () => {
      try {
        const promises = selectedWebsites.map(async (websiteId) => {
          const websiteResponse = await fetch(
            `http://localhost:5000/api/createWebsite/website/${websiteId}`
          );
          const websiteData = await websiteResponse.json();
          
          const categoriesResponse = await fetch(
            `http://localhost:5000/api/ad-categories/${websiteId}/advertiser`,
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
          );
          const categoriesData = await categoriesResponse.json();

          return {
            websiteId,
            websiteName: websiteData.websiteName,
            categories: categoriesData.categories || [],
          };
        });
        
        const result = await Promise.all(promises);
        setCategoriesByWebsite(result);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    fetchCategories();
  }, [selectedWebsites, navigate]);

  const handleCategorySelection = (categoryId) => {
    // Only allow ONE category selection
    setSelectedCategories([categoryId]);
    
    // Get the full category details
    const categoryDetail = categoriesByWebsite
      .flatMap(w => w.categories)
      .find(cat => cat._id === categoryId);
    
    setSelectedCategoryDetails(categoryDetail);
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      alert('Please select a category');
      return;
    }

    // Navigate to ad upload with category requirements
    navigate('/upload-ad', {
      state: {
        selectedWebsites,
        selectedCategories,
        categoryRequirements: selectedCategoryDetails
      }
    });
  };

  return (
    <div>
      {/* Category selection UI */}
      {selectedCategoryDetails && (
        <div className="requirements-preview">
          <h3>Selected Category Requirements:</h3>
          <p>Size: {selectedCategoryDetails.adSize.width}x{selectedCategoryDetails.adSize.height}</p>
          <p>Allowed Types: {selectedCategoryDetails.allowedAdTypes.join(', ')}</p>
        </div>
      )}
      <button onClick={handleNext} disabled={selectedCategories.length === 0}>
        Next: Upload Ad
      </button>
    </div>
  );
}

// ============================================
// 3. UploadAdForWeb.js (MODIFIED WITH VALIDATION)
// ============================================
function UploadAdWithValidation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWebsites, selectedCategories, categoryRequirements } = location.state || {};

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (!categoryRequirements) {
      navigate('/select-categories');
    }
  }, [categoryRequirements, navigate]);

  const validateFile = (selectedFile) => {
    const errors = [];

    // 1. Check file type
    const fileType = selectedFile.type.split('/')[0]; // 'image', 'video', etc.
    let normalizedType = fileType;
    
    if (selectedFile.type === 'image/gif') {
      normalizedType = 'gif';
    } else if (selectedFile.type.includes('html')) {
      normalizedType = 'html5';
    }

    if (!categoryRequirements.allowedAdTypes.includes(normalizedType)) {
      errors.push(
        `File type '${normalizedType}' not allowed. Accepted types: ${categoryRequirements.allowedAdTypes.join(', ')}`
      );
    }

    // 2. Check image dimensions (for images only)
    if (fileType === 'image') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const requiredWidth = categoryRequirements.adSize.width;
          const requiredHeight = categoryRequirements.adSize.height;

          if (img.width !== requiredWidth || img.height !== requiredHeight) {
            errors.push(
              `Image dimensions must be exactly ${requiredWidth}x${requiredHeight}px. Your image is ${img.width}x${img.height}px`
            );
          }

          URL.revokeObjectURL(img.src);
          resolve(errors);
        };
        img.onerror = () => {
          errors.push('Failed to load image for validation');
          resolve(errors);
        };
        img.src = URL.createObjectURL(selectedFile);
      });
    }

    // 3. Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    return Promise.resolve(errors);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    setError(null);
    setValidationErrors([]);

    const errors = await validateFile(selectedFile);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setFile(null);
      setFilePreview(null);
      return;
    }

    // File is valid
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        url: reader.result,
        type: selectedFile.type,
        name: selectedFile.name,
        size: selectedFile.size
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleNext = () => {
    if (!file) {
      setError('Please upload a valid ad file');
      return;
    }

    // Navigate to business info form
    navigate('/insert-data', {
      state: {
        selectedWebsites,
        selectedCategories,
        file
      }
    });
  };

  return (
    <div className="upload-container">
      <div className="requirements-card">
        <h2>Ad Requirements</h2>
        <div className="requirement-item">
          <strong>Size:</strong> {categoryRequirements.adSize.width}x{categoryRequirements.adSize.height}px
        </div>
        <div className="requirement-item">
          <strong>Allowed Types:</strong> {categoryRequirements.allowedAdTypes.join(', ').toUpperCase()}
        </div>
        <div className="requirement-item">
          <strong>Max File Size:</strong> 50MB
        </div>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        accept={categoryRequirements.allowedAdTypes.map(type => {
          if (type === 'image') return 'image/*';
          if (type === 'video') return 'video/*';
          if (type === 'gif') return 'image/gif';
          return '';
        }).join(',')}
      />

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>❌ File does not meet requirements:</h3>
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {filePreview && (
        <div className="preview">
          <h3>✅ Valid Ad Preview:</h3>
          {filePreview.type.startsWith('image') && (
            <img src={filePreview.url} alt="Preview" />
          )}
          {filePreview.type.startsWith('video') && (
            <video src={filePreview.url} controls />
          )}
        </div>
      )}

      <button onClick={handleNext} disabled={!file}>
        Next: Business Information
      </button>
    </div>
  );
}

// ============================================
// 4. BusinessForm.js (SIMPLIFIED)
// ============================================
function BusinessForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWebsites, selectedCategories, file } = location.state || {};

  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessLink: '',
    businessLocation: '',
    adDescription: ''
  });

  const handleNext = () => {
    // Validate business info
    if (!businessData.businessName) {
      alert('Business name is required');
      return;
    }

    // Navigate to payment/review
    navigate('/review-and-pay', {
      state: {
        selectedWebsites,
        selectedCategories,
        file,
        ...businessData
      }
    });
  };

  return (
    <div>
      <form>
        <input
          type="text"
          placeholder="Business Name"
          value={businessData.businessName}
          onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
          required
        />
        {/* Other fields */}
        <button onClick={handleNext}>Review & Pay</button>
      </form>
    </div>
  );
}

// ============================================
// 5. UPDATED BACKEND CONTROLLER
// ============================================
exports.createImportAd = [upload.single('file'), async (req, res) => {
  try {
    const {
      adOwnerEmail,
      businessName,
      businessLink,
      businessLocation,
      adDescription,
      selectedWebsites,
      selectedCategories,
    } = req.body;

    // Parse arrays
    const websitesArray = JSON.parse(selectedWebsites);
    const categoriesArray = JSON.parse(selectedCategories);

    // VALIDATE FILE AGAINST CATEGORY REQUIREMENTS
    const category = await AdCategory.findById(categoriesArray[0]);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Ad file is required' });
    }

    // Validate file type
    const fileType = req.file.mimetype.split('/')[0];
    let normalizedType = fileType;
    
    if (req.file.mimetype === 'image/gif') normalizedType = 'gif';
    if (req.file.mimetype.includes('html')) normalizedType = 'html5';

    if (!category.allowedAdTypes.includes(normalizedType)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: `This category only accepts: ${category.allowedAdTypes.join(', ')}`
      });
    }

    // Upload file to storage
    const blob = bucket.file(`${Date.now()}-${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', async () => {
        await blob.makePublic();
        resolve();
      });
      blobStream.end(req.file.buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
    let imageUrl = '', videoUrl = '', pdfUrl = '';
    if (req.file.mimetype.startsWith('image')) imageUrl = publicUrl;
    if (req.file.mimetype.startsWith('video')) videoUrl = publicUrl;
    if (req.file.mimetype === 'application/pdf') pdfUrl = publicUrl;

    // Create ad with website selections
    const websiteSelections = websitesArray.map(websiteId => ({
      websiteId,
      categories: categoriesArray,
      approved: false,
      status: 'pending'
    }));

    const ownerId = req.user?.userId || req.user?.id;
    const user = await User.findById(ownerId);

    const newRequestAd = new ImportAd({
      userId: user._id.toString(),
      adOwnerEmail: adOwnerEmail || user.email,
      imageUrl,
      videoUrl,
      pdfUrl,
      businessName,
      businessLink,
      businessLocation,
      adDescription,
      websiteSelections,
      confirmed: true,
    });

    const savedAd = await newRequestAd.save();

    res.status(201).json({
      success: true,
      data: savedAd,
      message: 'Ad created successfully. Proceed with payment.'
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}];