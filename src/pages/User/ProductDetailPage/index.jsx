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
      message: "Th??ng b??o",
      description: "???? th??m s???n ph???m v??o gi??? h??ng",
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
      notification.warn({ message: "B???n c???n ????ng nh???p" });
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
              <Badge.Ribbon color="red" text="M???i">
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
      label: <h2 style={{ color: "#333" }}>M?? t???</h2>,
      key: "1",
      children: (
        <S.ProductContent
          dangerouslySetInnerHTML={{ __html: productDetail.data.content }}
        />
      ),
    },
    {
      label: <h2 style={{ color: "#333" }}>C??ch ch???n size gi??y</h2>,
      key: "3",
      children: (
        <S.GuidelineContainer>
          <p style={{ color: "#333" }}>
            ????? ch???n size gi??y ph?? h???p v???i ch??n c???a m??nh, b???n c?? th??? l??m theo
            c??ch sau:
          </p>
          <p style={{ color: "#333" }}>
            <b style={{ color: "#333" }}>B?????c 1: </b> ??o chi???u d??i b??n ch??n theo
            hu???ng d???n ??? h??nh d?????i:
          </p>
          <Row justify="center">
            <Image
              preview={false}
              src="https://shopgiayreplica.com/wp-content/uploads/2018/07/cach-chon-size-giay-nike-adidas-1.jpg"
            />
          </Row>
          <p>
            <b>B?????c 2: </b>Sau khi ??o ???????c chi???u d??i b??n ch??n, b???n c?? th??? ?????i
            chi???u v???i b???ng size gi??y d?????i ????? ch???n ???????c size gi??y ph?? h???p cho
            m??nh. V?? d??? chi???u d??i b??n ch??n l?? 26.5cm th?? size gi??y nam Adidas
            ph?? h???p l?? 42.
          </p>
          <Row justify="center">
            <Image
              preview={false}
              src="https://shopgiayreplica.com/wp-content/uploads/2018/07/cach-chon-size-giay-nike-adidas-2.jpg"
            />
          </Row>
          <p>Ch??c c??c b???n l???a ch???n ???????c ????i gi??y ??ng ??</p>
        </S.GuidelineContainer>
      ),
    },
    {
      label: <h2 style={{ color: "#333" }}>????nh gi??</h2>,
      key: "2",
      children: (
        <S.ReviewItemContainer>
          <Row>
            <Col span={24}>
              {userInfo.data.id ? (
                <S.ProductRatingForm>
                  <h2 className="rating_header">????NH GI?? S???N PH???M</h2>
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
                      ????nh gi??
                    </S.CustomBtn>
                  </Form>
                </S.ProductRatingForm>
              ) : (
                <h2 className="rating_header">
                  ????ng nh???p ????? ????nh gi?? s???n ph???m
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
                        tr??n 5 sao
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
                        Ch??a c?? ????nh gi??
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
                      <p> {reviewList.data.length} kh??ch h??ng ???? ????nh gi??</p>
                    </div>
                    {productDetail.data.discount > 0 ? (
                      <div className="product_price">
                        <p className="new_price">
                          {`${calcDiscount(
                            productDetail.data.price,
                            productDetail.data.discount
                          ).toLocaleString()} ??? -`}
                        </p>{" "}
                        <p className="price_old">
                          {`  ${productDetail.data.price?.toLocaleString()} ???`}
                        </p>
                      </div>
                    ) : (
                      <p className="new_price">{`${productDetail.data.price?.toLocaleString()} ???`}</p>
                    )}
                    <Space>
                      {productDetail.data.category?.id ===
                        productDetail.data.categoryId && (
                        <div className="product_detail">
                          {`Th????ng hi???u: ${productDetail.data.category?.name.toUpperCase()}`}
                        </div>
                      )}
                      <div
                        className="product_detail"
                        style={{ marginLeft: "50px" }}
                      >
                        {`Gi???i t??nh: ${
                          productDetail.data.gender === 1 ? "Nam" : "N???"
                        }`}
                      </div>
                    </Space>
                    <div className="product_detail">
                      {selectedOptionData ? (
                        <p>
                          S??? l?????ng c??n l???i: {selectedOptionData?.sizeQuantity}
                        </p>
                      ) : (
                        <S.MessageError>
                          Ch???n size ????? xem s??? l?????ng c??n l???i
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
                            <S.MessageError>Vui l??ng ch???n size</S.MessageError>
                          ) : (
                            ""
                          )}
                          {(error &&
                            selectedProductCart?.quantity >=
                              selectedOptionData?.sizeQuantity) ||
                          productQuantity + selectedProductCart?.quantity >
                            selectedOptionData?.sizeQuantity ? (
                            <S.MessageError>
                              S??? l?????ng s???n ph???m trong gi??? h??ng ???? ?????t gi???i h???n
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
                                Th??m v??o gi??? h??ng
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
                                  Th??m y??u th??ch
                                </p>
                              ) : (
                                <p>
                                  {" "}
                                  {productDetail.data?.favorites?.length ||
                                    " "}{" "}
                                  ???? y??u th??ch
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
                      <div className="policy_title">Ch??nh s??ch</div>
                      <ul className="policy_content">
                        <li className="policy_item">
                          <S.CheckIcon />
                          Ship COD to??n qu???c
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Gi???m Gi?? To??n B??? S???n Ph???m L??n ?????n 60%
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Nh???n h??ng v?? ki???m tra tr?????c khi thanh to??n
                        </li>
                        <li className="policy_item">
                          <S.CheckIcon />
                          Mi???n ph?? v???n chuy???n trong n???i th??nh ???? N???ng
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
                      <p>Gi??y {productDetail.data?.category?.name}</p>
                      <h2>S???n ph???m t????ng t???</h2>
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
