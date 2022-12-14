import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Radio,
  InputNumber,
  Tabs,
  notification,
  Image,
  Form,
  Input,
  Rate,
  Badge,
} from "antd";
import { useParams, useLocation, Link, generatePath } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import {
  CheckCircleTwoTone,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { GiWalkingBoot } from "react-icons/gi";

import {
  getProductDetailAction,
  addToCartAction,
  favoriteProductAction,
  unFavoriteProductAction,
  postReviewAction,
  getReviewListAction,
  getProductListAction,
  getCategoryListAction,
} from "../../../redux/actions";
import SyncSlider from "./components/SyncSlider";
import ReviewItem from "./components/ReviewItem";
import ImageSlider from "./components/ImageSlider";
import TopWrapper from "../../../components/TopWrapper";
import LoadingWrapper from "../../../components/LoadingWrapper";
import ProductItem from "../../../components/ProductItem";
import { ROUTES, TITLES } from "../../../constants";
import { BREADCRUMB } from "./constants";
import { calcDiscount } from "../../../utils/function/product";
import { PRODUCT_RELATED_LIMIT } from "../../../constants/pagination";

import * as S from "./styles";

const ProductDetailPage = () => {
  const { id } = useParams();
  const productId = parseInt(id.split(".")[1]);
  const dispatch = useDispatch();
  const [reviewForm] = Form.useForm();

  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);

  const [error, setError] = useState(false);
  const { productDetail, productList } = useSelector((state) => state.product);
  const { cartList } = useSelector((state) => state.cart);
  const hasOptions = !!productDetail.data.options?.length;
  const selectedProductCart = cartList?.find(
    (item) => item.optionId === selectedOptionId
  );
  const selectedOptionData = productDetail.data.options?.find(
    (item) => item.id === selectedOptionId
  );

  const bonusPrice = selectedOptionData ? selectedOptionData.bonusPrice : 0;
  const productPrice = (productDetail.data.price || 0) + bonusPrice;

  const { userInfo } = useSelector((state) => state.user);
  const { reviewList } = useSelector((state) => state.review);
  const { state } = useLocation();

  const isLike = userInfo.data.id
    ? productDetail.data.favorites?.some(
        (item) => item.userId === userInfo.data.id
      )
    : false;

  useEffect(() => {
    dispatch(getProductDetailAction({ id: productId }));
    dispatch(getReviewListAction({ productId: productId }));

    document.title = TITLES.USER.PRODUCT_DETAILS;
  }, [productId]);

  // useEffect(() => {
  //   if (hasOptions) {
  //     setSelectedOptionId(productDetail.data.options[0].id);
  //   }
  // }, [productDetail.data, hasOptions]);

  useEffect(() => {
    if (state?.categoryId?.length) {
      dispatch(
        getProductListAction({
          params: {
            categoryId: state.categoryId,
            page: 1,
            limit: PRODUCT_RELATED_LIMIT,
          },
        })
      );
    } else {
      dispatch(
        getProductListAction({
          params: {
            page: 1,
            limit: PRODUCT_RELATED_LIMIT,
          },
        })
      );
    }
    dispatch(
      getCategoryListAction({
        params: {
          page: 1,
        },
      })
    );
  }, [state]);

  const handleNotification = () => {
    notification.open({
      message: "Thông báo",
      description: "Đã thêm sản phẩm vào giỏ hàng",
      duration: 1,
      icon: (
        <CheckCircleTwoTone
          style={{
            color: "#11f924",
          }}
        />
      ),
    });
  };

  const handleAddToCart = () => {
    selectedOptionData === undefined ||
    productQuantity > selectedOptionData?.sizeQuantity ||
    productQuantity + selectedProductCart?.quantity >
      selectedOptionData?.sizeQuantity
      ? setError(true)
      : dispatch(
          addToCartAction({
            ...(selectedOptionData && {
              optionId: selectedOptionData.id,
              size: selectedOptionData.size,
              sizeQuantity: selectedOptionData.sizeQuantity,
              optionName: selectedOptionData.name,
            }),
            quantity: productQuantity,
            productId: productId,
            price: productDetail.data.price,
            productBrand: productDetail.data.category?.name,
            productName: productDetail.data.name,
            slug: productDetail.data.name,
            amount: productDetail.data.amount,
            discount: productDetail.data.discount,
            image: productDetail.data?.images[0]?.url,
          })
        ) && handleNotification();
  };

  const handleToggleFavorite = () => {
    if (userInfo.data.id) {
      if (isLike) {
        const favoriteData = productDetail.data.favorites?.find(
          (item) => item.userId === userInfo.data.id
        );
        if (favoriteData) {
          dispatch(
            unFavoriteProductAction({
              id: favoriteData.id,
              productId: productDetail.data.id,
            })
          );
        }
      } else {
        dispatch(
          favoriteProductAction({
            userId: userInfo.data.id,
            productId: productDetail.data.id,
          })
        );
      }
    } else {
      notification.warn({ message: "Bạn cần đăng nhập" });
    }
  };

  const handlePostReview = (values) => {
    dispatch(
      postReviewAction({
        ...values,
        userId: userInfo.data.id,
        productId: productDetail.data.id,
      })
    );
  };

  const handleRating = () => {
    const rating = reviewList.data.map((item) => {
      if (item.rate === undefined) {
        return 0;
      }
      return item.rate;
    });

    const sumRating = rating.reduce((a, b) => parseInt(a) + parseInt(b), 0);

    const avgRating = Math.round(sumRating / rating.length);
    return avgRating;
  };

  const renderProductList = () => {
    const similarProductList = productList.data.filter((item) => {
      return (
        item.categoryId === productDetail?.data?.categoryId &&
        item.id !== productId
      );
    });
    return similarProductList?.map((item) => {
      return (
        <Col
          style={{ marginTop: "20px" }}
          xs={24}
          sm={12}
          lg={24}
          xl={12}
          xxl={12}
          key={item.id}
        >
          {item.isNew ? (
            <Link
              to={generatePath(ROUTES.USER.PRODUCT_DETAILS, {
                id: `${item.slug}.${item.id}`,
              })}
            >
              <Badge.Ribbon color="red" text="Mới">
                <ProductItem item={item} />
              </Badge.Ribbon>
            </Link>
          ) : (
            <Link
              to={generatePath(ROUTES.USER.PRODUCT_DETAILS, {
                id: `${item.slug}.${item.id}`,
              })}
            >
              <ProductItem item={item} />
            </Link>
          )}
        </Col>
      );
    });
  };

  const renderProductOptions = useMemo(() => {
    if (!productDetail.data.options?.length) return null;
    return productDetail.data.options?.map((item) => {
      return (
        <Radio key={item.id} value={item.id}>
          {item.size}
        </Radio>
      );
    });
  }, [productDetail.data]);

  const TAB_ITEMS = [
    {
      label: <h2 style={{ color: "#333" }}>Mô tả</h2>,
      key: "1",
      children: (
        <S.ProductContent
          dangerouslySetInnerHTML={{ __html: productDetail.data.content }}
        />
      ),
    },
    {
      label: <h2 style={{ color: "#333" }}>Cách chọn size giày</h2>,
      key: "3",
      children: (
        <S.GuidelineContainer>
          <p style={{ color: "#333" }}>
            Để chọn size giày phù hợp với chân của mình, bạn có thể làm theo
            cách sau:
          </p>
          <p style={{ color: "#333" }}>
            <b style={{ color: "#333" }}>Bước 1: </b> Đo chiều dài bàn chân theo
            huớng dẫn ở hình dưới:
          </p>
          <Row justify="center">
            <Image
              preview={false}
              src="https://shopgiayreplica.com/wp-content/uploads/2018/07/cach-chon-size-giay-nike-adidas-1.jpg"
            />
          </Row>
          <p>
            <b>Bước 2: </b>Sau khi đo được chiều dài bàn chân, bạn có thể đối
            chiếu với bảng size giày dưới để chọn được size giày phù hợp cho
            mình. Ví dụ chiều dài bàn chân là 26.5cm thì size giày nam Adidas
            phù hợp là 42.
          </p>
          <Row justify="center">
            <Image
              preview={false}
              src="https://shopgiayreplica.com/wp-content/uploads/2018/07/cach-chon-size-giay-nike-adidas-2.jpg"
            />
          </Row>
          <p>Chúc các bạn lựa chọn được đôi giày ưng ý</p>
        </S.GuidelineContainer>
      ),
    },
    {
      label: <h2 style={{ color: "#333" }}>Đánh giá</h2>,
      key: "2",
      children: (
        <S.ReviewItemContainer>
          <Row>
            <Col span={24}>
              {userInfo.data.id ? (
                <S.ProductRatingForm>
                  <h2 className="rating_header">ĐÁNH GIÁ SẢN PHẨM</h2>
                  <Form
                    form={reviewForm}
                    layout="vertical"
                    className="rating_form"
                    onFinish={(values) => {
                      handlePostReview(values);
                      reviewForm.resetFields();
                    }}
                  >
                    <Form.Item label="Rate" name="rate">
                      <Rate />
                    </Form.Item>
                    <Form.Item label="Comment" name="comment">
                      <Input.TextArea autoSize={{ maxRows: 6, minRows: 2 }} />
                    </Form.Item>
                    <S.CustomBtn htmlType="submit" block>
                      Đánh giá
                    </S.CustomBtn>
                  </Form>
                </S.ProductRatingForm>
              ) : (
                <h2 className="rating_header">
                  Đăng nhập để đánh giá sản phẩm
                </h2>
              )}
              <S.ProductRatingContainer>
                <div className="rating_overview">
                  <div className="rating_overview_briefing">
                    <Rate value={handleRating()} disabled />
                  </div>
                  {handleRating() > 0 ? (
                    <div className="rating_overview_filter">
                      <span
                        className="royalblue_color"
                        style={{ fontSize: "1.875rem" }}
                      >
                        {handleRating()}
                      </span>{" "}
                      <span
                        className="royalblue_color"
                        style={{ fontSize: "1.125rem" }}
                      >
                        trên 5 sao
                      </span>
                    </div>
                  ) : (
                    <div className="rating_overview_filter">
                      <span
                        className="royalblue_color"
                        style={{ fontSize: "1.875rem" }}
                      ></span>{" "}
                      <span
                        className="royalblue_color"
                        style={{ fontSize: "1.125rem" }}
                      >
                        Chưa có đánh giá
                      </span>
                    </div>
                  )}
                </div>
                <ReviewItem reviewList={reviewList} />
              </S.ProductRatingContainer>
            </Col>
          </Row>
        </S.ReviewItemContainer>
      ),
    },
  ];
  return (
    <>
      <TopWrapper
        breadcrumb={[
          ...BREADCRUMB,
          {
            title: productDetail.data.category?.name,
            path: ROUTES.USER.PRODUCT_LIST,
            state: { categoryId: [productDetail.data.category?.id] },
            icon: <GiWalkingBoot style={{ fontSize: 20 }} />,
          },
          {
            title: productDetail.data.name,
          },
        ]}
        height={300}
      />
      {productDetail.data.loading ? (
        <LoadingWrapper />
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={2}></Col>
          <Col span={20}>
            <S.ProductInfo>
              <Row gutter={[16, 16]}>
                <Col
                  xs={24}
                  sm={24}
                  lg={24}
                  xl={12}
                  xxl={12}
                  className="product_img"
                >
                  <SyncSlider images={productDetail.data.images} />
                  {/* <ImageSlider item={productDetail.data} /> */}
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  lg={24}
                  xl={12}
                  xxl={12}
                  className="product_discription"
                >
                  <Col>
                    <div className="product_name">
                      {productDetail.data.name}
                    </div>
                    <div className="product_rate">
                      <Rate
                        className="royalblue_color"
                        value={handleRating()}
                        disabled
                      />{" "}
                      <p> {reviewList.data.length} khách hàng đã đánh giá</p>
                    </div>
                    {productDetail.data.discount > 0 ? (
                      <div className="product_price">
                        <p className="new_price">
                          {`${calcDiscount(
                            productDetail.data.price,
                            productDetail.data.discount
                          ).toLocaleString()} ₫ -`}
                        </p>{" "}
                        <p className="price_old">
                          {`  ${productDetail.data.price?.toLocaleString()} ₫`}
                        </p>
                      </div>
                    ) : (
                      <p className="new_price">{`${productDetail.data.price?.toLocaleString()} ₫`}</p>
                    )}
                    <Space>
                      {productDetail.data.category?.id ===
                        productDetail.data.categoryId && (
                        <div className="product_detail">
                          {`Thương hiệu: ${productDetail.data.category?.name.toUpperCase()}`}
                        </div>
                      )}
                      <div
                        className="product_detail"
                        style={{ marginLeft: "50px" }}
                      >
                        {`Giới tính: ${
                          productDetail.data.gender === 1 ? "Nam" : "Nữ"
                        }`}
                      </div>
                    </Space>
                    <div className="product_detail">
                      {selectedOptionData ? (
                        <p>
                          Số lượng còn lại: {selectedOptionData?.sizeQuantity}
                        </p>
                      ) : (
                        <S.MessageError>
                          Chọn size để xem số lượng còn lại
                        </S.MessageError>
                      )}
                    </div>

                    {hasOptions && (
                      <div className="product_size">
                        <b>Size: </b>
                        <div className="size_group">
                          <Radio.Group
                            optionType="button"
                            buttonStyle="solid"
                            onChange={(e) => {
                              setError(false);
                              setSelectedOptionId(e.target.value);
                            }}
                          >
                            {renderProductOptions}
                          </Radio.Group>
                        </div>
                        <div>
                          {error && selectedOptionData === undefined ? (
                            <S.MessageError>Vui lòng chọn size</S.MessageError>
                          ) : (
                            ""
                          )}
                          {(error &&
                            selectedProductCart?.quantity >=
                              selectedOptionData?.sizeQuantity) ||
                          productQuantity + selectedProductCart?.quantity >
                            selectedOptionData?.sizeQuantity ? (
                            <S.MessageError>
                              Số lượng sản phẩm trong giỏ hàng đã đạt giới hạn
                            </S.MessageError>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    )}
                    <div className="action_container">
                      <Row style={{ padding: "20px 0px" }} gutter={(0, 0)}>
                        <Col flex={3}>
                          <Row>
                            <Col>
                              <InputNumber
                                size="large"
                                min={1}
                                max={selectedOptionData?.sizeQuantity}
                                onChange={(value) => {
                                  if (
                                    productQuantity >
                                    selectedOptionData?.sizeQuantity
                                  )
                                    return setProductQuantity(1);
                                  setProductQuantity(value);
                                }}
                                value={productQuantity}
                              />
                            </Col>
                            <Col>
                              <S.CustomBtn
                                size="large"
                                onClick={() => handleAddToCart()}
                              >
                                <AiOutlineShoppingCart
                                  style={{ marginRight: 8 }}
                                />
                                Thêm vào giỏ hàng
                              </S.CustomBtn>
                            </Col>
                          </Row>
                        </Col>
                        <Col style={{ flex: "0 2 auto" }} flex={2}>
                          <S.FavoritetBtn
                            ghost={isLike}
                            danger={isLike}
                            size="large"
                            onClick={() => handleToggleFavorite()}
                            icon={isLike ? <HeartFilled /> : <HeartOutlined />}
                          >
                            <span className="liked_count">
                              {!isLike ? (
                                <p>
                                  {" "}
                                  {productDetail.data?.favorites?.length ||
                                    " "}{" "}
                                  Thêm yêu thích
                                </p>
                              ) : (
                                <p>
                                  {" "}
                                  {productDetail.data?.favorites?.length ||
                                    " "}{" "}
                                  Đã yêu thích
                                </p>
                              )}
                            </span>
                          </S.FavoritetBtn>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col>
                    <div className="policy_content">
                      <div className="policy_title">Chính sách</div>
                      <ul className="policy_content">
                        <li className="policy_item">
                          <S.CheckIcon />
                          Ship COD toàn quốc
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Giảm Giá Toàn Bộ Sản Phẩm Lên Đến 60%
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Nhận hàng và kiểm tra trước khi thanh toán
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Miễn phí vận chuyển trong nội thành Đà Nẵng
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Col>
              </Row>
            </S.ProductInfo>
            <S.ProductDetail>
              <Row>
                <Col
                  className="product_review"
                  xs={24}
                  sm={24}
                  lg={16}
                  xl={13}
                  xxl={14}
                >
                  <Card>
                    <Tabs centered defaultActiveKey="1" items={TAB_ITEMS} />
                  </Card>
                </Col>
                <Col
                  className="product_related_col"
                  xs={24}
                  sm={24}
                  lg={8}
                  xl={11}
                  xxl={10}
                >
                  <div className="product_related">
                    <div className="product_related_title">
                      <p>Giày {productDetail.data?.category?.name}</p>
                      <h2>Sản phẩm tương tự</h2>
                    </div>
                    <Row style={{ marginTop: "-20px" }} gutter={(16, 16)}>
                      {renderProductList()}
                    </Row>
                  </div>
                </Col>
              </Row>
            </S.ProductDetail>
          </Col>
          <Col span={2}></Col>
        </Row>
      )}
    </>
  );
};

export default ProductDetailPage;
