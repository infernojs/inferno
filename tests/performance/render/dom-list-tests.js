


function createDataModels() {
    let dataModels = [];

    dataModels.push(addGroupSingleChild(500));

    return dataModels;
}

function addGroupSingleChild(count) {
    let dataModel = [];
    for(let i = 0; i < count; i++) {
        dataModel.push({
            key: i,
            children: null
        });
    }
    return dataModel;
}

//these are replicas of the vdom benchmark test
export default function domListTests(describe, expect, Inferno) {
    describe('DOM lists tests (perf is in console)', () => {
        let container;
        let dataModels = null;

        beforeEach(() => {
            container = document.createElement('div');
            dataModels = createDataModels();
        });

        afterEach(() => {
            Inferno.unmountComponentAtNode(container);
            container = null;
            dataModels = null;
        });

        describe('using the Inferno functional API', () => {
            let template1 = Inferno.createTemplate((t, children) => {
                return t("div", null, children);
            });

            let template2 = Inferno.createTemplate((t, text) => {
                return t("span", null, text);
            });

            afterEach(() => {
                Inferno.unmountComponentAtNode(container);
            });

            function renderTree(nodes) {
                var children = [];
                var i;
                var e;
                var n;

                for (i = 0; i < nodes.length; i++) {
                  n = nodes[i];
                  if (n.children !== null) {
                    children.push(
                        Inferno.createFragment([n.key, renderTree(n.children)], template1, n.key)
                    );
                  } else {
                    children.push(
                        Inferno.createFragment([n.key, n.key.toString()], template2, n.key)
                    );
                  }
                }

                return children;
            }

            describe("test 1", () => {
                it('keyed list: insertFirst(500)', () => {
                    //we use the first dataModel for this
                    let dataModel = dataModels[0];

                    console.time("keyed list: insertFirst(500)");
                    Inferno.render(
                        Inferno.createFragment([renderTree(dataModel)], template1),
                        container
                    );
                    console.timeEnd("keyed list: insertFirst(500)");

                    expect(container.innerHTML).to.equal(
                        "<div><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span>32</span><span>33</span><span>34</span><span>35</span><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span><span>42</span><span>43</span><span>44</span><span>45</span><span>46</span><span>47</span><span>48</span><span>49</span><span>50</span><span>51</span><span>52</span><span>53</span><span>54</span><span>55</span><span>56</span><span>57</span><span>58</span><span>59</span><span>60</span><span>61</span><span>62</span><span>63</span><span>64</span><span>65</span><span>66</span><span>67</span><span>68</span><span>69</span><span>70</span><span>71</span><span>72</span><span>73</span><span>74</span><span>75</span><span>76</span><span>77</span><span>78</span><span>79</span><span>80</span><span>81</span><span>82</span><span>83</span><span>84</span><span>85</span><span>86</span><span>87</span><span>88</span><span>89</span><span>90</span><span>91</span><span>92</span><span>93</span><span>94</span><span>95</span><span>96</span><span>97</span><span>98</span><span>99</span><span>100</span><span>101</span><span>102</span><span>103</span><span>104</span><span>105</span><span>106</span><span>107</span><span>108</span><span>109</span><span>110</span><span>111</span><span>112</span><span>113</span><span>114</span><span>115</span><span>116</span><span>117</span><span>118</span><span>119</span><span>120</span><span>121</span><span>122</span><span>123</span><span>124</span><span>125</span><span>126</span><span>127</span><span>128</span><span>129</span><span>130</span><span>131</span><span>132</span><span>133</span><span>134</span><span>135</span><span>136</span><span>137</span><span>138</span><span>139</span><span>140</span><span>141</span><span>142</span><span>143</span><span>144</span><span>145</span><span>146</span><span>147</span><span>148</span><span>149</span><span>150</span><span>151</span><span>152</span><span>153</span><span>154</span><span>155</span><span>156</span><span>157</span><span>158</span><span>159</span><span>160</span><span>161</span><span>162</span><span>163</span><span>164</span><span>165</span><span>166</span><span>167</span><span>168</span><span>169</span><span>170</span><span>171</span><span>172</span><span>173</span><span>174</span><span>175</span><span>176</span><span>177</span><span>178</span><span>179</span><span>180</span><span>181</span><span>182</span><span>183</span><span>184</span><span>185</span><span>186</span><span>187</span><span>188</span><span>189</span><span>190</span><span>191</span><span>192</span><span>193</span><span>194</span><span>195</span><span>196</span><span>197</span><span>198</span><span>199</span><span>200</span><span>201</span><span>202</span><span>203</span><span>204</span><span>205</span><span>206</span><span>207</span><span>208</span><span>209</span><span>210</span><span>211</span><span>212</span><span>213</span><span>214</span><span>215</span><span>216</span><span>217</span><span>218</span><span>219</span><span>220</span><span>221</span><span>222</span><span>223</span><span>224</span><span>225</span><span>226</span><span>227</span><span>228</span><span>229</span><span>230</span><span>231</span><span>232</span><span>233</span><span>234</span><span>235</span><span>236</span><span>237</span><span>238</span><span>239</span><span>240</span><span>241</span><span>242</span><span>243</span><span>244</span><span>245</span><span>246</span><span>247</span><span>248</span><span>249</span><span>250</span><span>251</span><span>252</span><span>253</span><span>254</span><span>255</span><span>256</span><span>257</span><span>258</span><span>259</span><span>260</span><span>261</span><span>262</span><span>263</span><span>264</span><span>265</span><span>266</span><span>267</span><span>268</span><span>269</span><span>270</span><span>271</span><span>272</span><span>273</span><span>274</span><span>275</span><span>276</span><span>277</span><span>278</span><span>279</span><span>280</span><span>281</span><span>282</span><span>283</span><span>284</span><span>285</span><span>286</span><span>287</span><span>288</span><span>289</span><span>290</span><span>291</span><span>292</span><span>293</span><span>294</span><span>295</span><span>296</span><span>297</span><span>298</span><span>299</span><span>300</span><span>301</span><span>302</span><span>303</span><span>304</span><span>305</span><span>306</span><span>307</span><span>308</span><span>309</span><span>310</span><span>311</span><span>312</span><span>313</span><span>314</span><span>315</span><span>316</span><span>317</span><span>318</span><span>319</span><span>320</span><span>321</span><span>322</span><span>323</span><span>324</span><span>325</span><span>326</span><span>327</span><span>328</span><span>329</span><span>330</span><span>331</span><span>332</span><span>333</span><span>334</span><span>335</span><span>336</span><span>337</span><span>338</span><span>339</span><span>340</span><span>341</span><span>342</span><span>343</span><span>344</span><span>345</span><span>346</span><span>347</span><span>348</span><span>349</span><span>350</span><span>351</span><span>352</span><span>353</span><span>354</span><span>355</span><span>356</span><span>357</span><span>358</span><span>359</span><span>360</span><span>361</span><span>362</span><span>363</span><span>364</span><span>365</span><span>366</span><span>367</span><span>368</span><span>369</span><span>370</span><span>371</span><span>372</span><span>373</span><span>374</span><span>375</span><span>376</span><span>377</span><span>378</span><span>379</span><span>380</span><span>381</span><span>382</span><span>383</span><span>384</span><span>385</span><span>386</span><span>387</span><span>388</span><span>389</span><span>390</span><span>391</span><span>392</span><span>393</span><span>394</span><span>395</span><span>396</span><span>397</span><span>398</span><span>399</span><span>400</span><span>401</span><span>402</span><span>403</span><span>404</span><span>405</span><span>406</span><span>407</span><span>408</span><span>409</span><span>410</span><span>411</span><span>412</span><span>413</span><span>414</span><span>415</span><span>416</span><span>417</span><span>418</span><span>419</span><span>420</span><span>421</span><span>422</span><span>423</span><span>424</span><span>425</span><span>426</span><span>427</span><span>428</span><span>429</span><span>430</span><span>431</span><span>432</span><span>433</span><span>434</span><span>435</span><span>436</span><span>437</span><span>438</span><span>439</span><span>440</span><span>441</span><span>442</span><span>443</span><span>444</span><span>445</span><span>446</span><span>447</span><span>448</span><span>449</span><span>450</span><span>451</span><span>452</span><span>453</span><span>454</span><span>455</span><span>456</span><span>457</span><span>458</span><span>459</span><span>460</span><span>461</span><span>462</span><span>463</span><span>464</span><span>465</span><span>466</span><span>467</span><span>468</span><span>469</span><span>470</span><span>471</span><span>472</span><span>473</span><span>474</span><span>475</span><span>476</span><span>477</span><span>478</span><span>479</span><span>480</span><span>481</span><span>482</span><span>483</span><span>484</span><span>485</span><span>486</span><span>487</span><span>488</span><span>489</span><span>490</span><span>491</span><span>492</span><span>493</span><span>494</span><span>495</span><span>496</span><span>497</span><span>498</span><span>499</span></div>"
                    );
                });

                it('keyed list: reverse(500)', () => {
                    //we use the first dataModel for this
                    let dataModel = dataModels[0];
                    dataModel.reverse();

                    console.time("keyed list: reverse(500)");
                    Inferno.render(
                        Inferno.createFragment([renderTree(dataModel)], template1),
                        container
                    );
                    console.timeEnd("keyed list: reverse(500)");

                    expect(container.innerHTML).to.equal(
                        "<div><span>499</span><span>498</span><span>497</span><span>496</span><span>495</span><span>494</span><span>493</span><span>492</span><span>491</span><span>490</span><span>489</span><span>488</span><span>487</span><span>486</span><span>485</span><span>484</span><span>483</span><span>482</span><span>481</span><span>480</span><span>479</span><span>478</span><span>477</span><span>476</span><span>475</span><span>474</span><span>473</span><span>472</span><span>471</span><span>470</span><span>469</span><span>468</span><span>467</span><span>466</span><span>465</span><span>464</span><span>463</span><span>462</span><span>461</span><span>460</span><span>459</span><span>458</span><span>457</span><span>456</span><span>455</span><span>454</span><span>453</span><span>452</span><span>451</span><span>450</span><span>449</span><span>448</span><span>447</span><span>446</span><span>445</span><span>444</span><span>443</span><span>442</span><span>441</span><span>440</span><span>439</span><span>438</span><span>437</span><span>436</span><span>435</span><span>434</span><span>433</span><span>432</span><span>431</span><span>430</span><span>429</span><span>428</span><span>427</span><span>426</span><span>425</span><span>424</span><span>423</span><span>422</span><span>421</span><span>420</span><span>419</span><span>418</span><span>417</span><span>416</span><span>415</span><span>414</span><span>413</span><span>412</span><span>411</span><span>410</span><span>409</span><span>408</span><span>407</span><span>406</span><span>405</span><span>404</span><span>403</span><span>402</span><span>401</span><span>400</span><span>399</span><span>398</span><span>397</span><span>396</span><span>395</span><span>394</span><span>393</span><span>392</span><span>391</span><span>390</span><span>389</span><span>388</span><span>387</span><span>386</span><span>385</span><span>384</span><span>383</span><span>382</span><span>381</span><span>380</span><span>379</span><span>378</span><span>377</span><span>376</span><span>375</span><span>374</span><span>373</span><span>372</span><span>371</span><span>370</span><span>369</span><span>368</span><span>367</span><span>366</span><span>365</span><span>364</span><span>363</span><span>362</span><span>361</span><span>360</span><span>359</span><span>358</span><span>357</span><span>356</span><span>355</span><span>354</span><span>353</span><span>352</span><span>351</span><span>350</span><span>349</span><span>348</span><span>347</span><span>346</span><span>345</span><span>344</span><span>343</span><span>342</span><span>341</span><span>340</span><span>339</span><span>338</span><span>337</span><span>336</span><span>335</span><span>334</span><span>333</span><span>332</span><span>331</span><span>330</span><span>329</span><span>328</span><span>327</span><span>326</span><span>325</span><span>324</span><span>323</span><span>322</span><span>321</span><span>320</span><span>319</span><span>318</span><span>317</span><span>316</span><span>315</span><span>314</span><span>313</span><span>312</span><span>311</span><span>310</span><span>309</span><span>308</span><span>307</span><span>306</span><span>305</span><span>304</span><span>303</span><span>302</span><span>301</span><span>300</span><span>299</span><span>298</span><span>297</span><span>296</span><span>295</span><span>294</span><span>293</span><span>292</span><span>291</span><span>290</span><span>289</span><span>288</span><span>287</span><span>286</span><span>285</span><span>284</span><span>283</span><span>282</span><span>281</span><span>280</span><span>279</span><span>278</span><span>277</span><span>276</span><span>275</span><span>274</span><span>273</span><span>272</span><span>271</span><span>270</span><span>269</span><span>268</span><span>267</span><span>266</span><span>265</span><span>264</span><span>263</span><span>262</span><span>261</span><span>260</span><span>259</span><span>258</span><span>257</span><span>256</span><span>255</span><span>254</span><span>253</span><span>252</span><span>251</span><span>250</span><span>249</span><span>248</span><span>247</span><span>246</span><span>245</span><span>244</span><span>243</span><span>242</span><span>241</span><span>240</span><span>239</span><span>238</span><span>237</span><span>236</span><span>235</span><span>234</span><span>233</span><span>232</span><span>231</span><span>230</span><span>229</span><span>228</span><span>227</span><span>226</span><span>225</span><span>224</span><span>223</span><span>222</span><span>221</span><span>220</span><span>219</span><span>218</span><span>217</span><span>216</span><span>215</span><span>214</span><span>213</span><span>212</span><span>211</span><span>210</span><span>209</span><span>208</span><span>207</span><span>206</span><span>205</span><span>204</span><span>203</span><span>202</span><span>201</span><span>200</span><span>199</span><span>198</span><span>197</span><span>196</span><span>195</span><span>194</span><span>193</span><span>192</span><span>191</span><span>190</span><span>189</span><span>188</span><span>187</span><span>186</span><span>185</span><span>184</span><span>183</span><span>182</span><span>181</span><span>180</span><span>179</span><span>178</span><span>177</span><span>176</span><span>175</span><span>174</span><span>173</span><span>172</span><span>171</span><span>170</span><span>169</span><span>168</span><span>167</span><span>166</span><span>165</span><span>164</span><span>163</span><span>162</span><span>161</span><span>160</span><span>159</span><span>158</span><span>157</span><span>156</span><span>155</span><span>154</span><span>153</span><span>152</span><span>151</span><span>150</span><span>149</span><span>148</span><span>147</span><span>146</span><span>145</span><span>144</span><span>143</span><span>142</span><span>141</span><span>140</span><span>139</span><span>138</span><span>137</span><span>136</span><span>135</span><span>134</span><span>133</span><span>132</span><span>131</span><span>130</span><span>129</span><span>128</span><span>127</span><span>126</span><span>125</span><span>124</span><span>123</span><span>122</span><span>121</span><span>120</span><span>119</span><span>118</span><span>117</span><span>116</span><span>115</span><span>114</span><span>113</span><span>112</span><span>111</span><span>110</span><span>109</span><span>108</span><span>107</span><span>106</span><span>105</span><span>104</span><span>103</span><span>102</span><span>101</span><span>100</span><span>99</span><span>98</span><span>97</span><span>96</span><span>95</span><span>94</span><span>93</span><span>92</span><span>91</span><span>90</span><span>89</span><span>88</span><span>87</span><span>86</span><span>85</span><span>84</span><span>83</span><span>82</span><span>81</span><span>80</span><span>79</span><span>78</span><span>77</span><span>76</span><span>75</span><span>74</span><span>73</span><span>72</span><span>71</span><span>70</span><span>69</span><span>68</span><span>67</span><span>66</span><span>65</span><span>64</span><span>63</span><span>62</span><span>61</span><span>60</span><span>59</span><span>58</span><span>57</span><span>56</span><span>55</span><span>54</span><span>53</span><span>52</span><span>51</span><span>50</span><span>49</span><span>48</span><span>47</span><span>46</span><span>45</span><span>44</span><span>43</span><span>42</span><span>41</span><span>40</span><span>39</span><span>38</span><span>37</span><span>36</span><span>35</span><span>34</span><span>33</span><span>32</span><span>31</span><span>30</span><span>29</span><span>28</span><span>27</span><span>26</span><span>25</span><span>24</span><span>23</span><span>22</span><span>21</span><span>20</span><span>19</span><span>18</span><span>17</span><span>16</span><span>15</span><span>14</span><span>13</span><span>12</span><span>11</span><span>10</span><span>9</span><span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div>"
                    );
                });
            });
        });
    });
};
